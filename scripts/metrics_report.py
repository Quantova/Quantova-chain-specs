#!/usr/bin/env python3
"""Quantova chain metrics report — qweb3.py

Collects a read-only performance and identity snapshot from a Quantova endpoint
using the official qweb3.py client. It samples twice over a short interval to derive
observed block time and finality lag. It signs nothing and submits nothing.

Usage:
    python metrics_report.py --rpc https://mainnet.quantova.io
    python metrics_report.py --rpc https://testnet.quantova.io --interval 10
    python metrics_report.py --rpc http://127.0.0.1:9933

Requires: pip install qweb3
"""

import argparse
import time

from qweb3 import QWeb3


def to_num(v):
    if isinstance(v, str) and v.startswith("0x"):
        return int(v, 16)
    return int(v)


def main():
    p = argparse.ArgumentParser(description="Quantova chain metrics report (qweb3.py)")
    p.add_argument("--rpc", default="https://mainnet.quantova.io", help="JSON-RPC endpoint")
    p.add_argument("--interval", type=int, default=8, help="seconds between samples")
    args = p.parse_args()

    q = QWeb3(args.rpc)
    print("Quantova metrics report (qweb3.py)")
    print(f"Endpoint: {args.rpc}")
    print("-" * 60)

    # Identity / runtime
    try:
        rv = q.rpc.call("state_getRuntimeVersion", [])
        print(f"Runtime            : {rv['specName']} v{rv['specVersion']} (tx v{rv['transactionVersion']})")
    except Exception as e:
        print(f"Runtime            : (unavailable: {e})")

    # Sample 1
    b1 = to_num(q.rpc.block_number())
    f1 = None
    try:
        f1 = to_num(q.rpc.call("chain_getHeader", [q.rpc.call("chain_getFinalizedHead", [])])["number"])
    except Exception:
        pass
    t1 = time.time()

    time.sleep(args.interval)

    # Sample 2
    b2 = to_num(q.rpc.block_number())
    f2 = None
    try:
        f2 = to_num(q.rpc.call("chain_getHeader", [q.rpc.call("chain_getFinalizedHead", [])])["number"])
    except Exception:
        pass
    t2 = time.time()

    elapsed = t2 - t1
    blocks = b2 - b1
    block_time = f"{elapsed / blocks:.2f}" if blocks > 0 else "n/a"

    print(f"Best block         : {b1} -> {b2}  (+{blocks} in ~{elapsed:.0f}s)")
    print(f"Observed block time: ~{block_time}s  (target ~2.5s)")
    if f2 is not None:
        print(f"Finalized head     : {f1} -> {f2}")
        print(f"Finality lag       : {b2 - f2} blocks behind best")

    # Fees
    try:
        fees = q.fees.estimate()
        t = fees["tiers"]
        print(f"Fee tiers          : slow={t['slow']} standard={t['standard']} fast={t['fast']} ({fees.get('model')})")
    except Exception as e:
        print(f"Fee tiers          : (unavailable: {e})")

    print("-" * 60)
    print("Read-only snapshot complete. No transactions were sent.")


if __name__ == "__main__":
    main()
