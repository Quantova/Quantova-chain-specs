# Tooling Verification Report

This report records verification of the Quantova client libraries used to connect to
and measure the network. It documents what was run and the result, and is honest
about what can and cannot be executed in an offline environment.

## qweb3.py — offline test suite: PASS

The Python client library's offline test suite was executed and passed in full:

```
42 checks passed, 0 failed
```

The suite runs fully offline using an injected HTTP session and a deterministic
stub crypto backend. It validates the `q_*` JSON-RPC client surface, the QVM
contract layer (ABI encoding/decoding, keccak-256 selectors and event topics),
QNS resolution, fee estimation, batch requests, event hooks, address derivation,
and the post-quantum signing/verification wrappers (against the stub backend).

Reproduce:

```bash
cd qweb3.py
python tests/test_offline.py
```

## qweb3.js — dependency note

The JavaScript client library depends on Quantova's native post-quantum packages
(the `@quantova/*` WASM modules, e.g. `@quantova/util-crypto`, `@quantova/keyring`,
`@quantova/falcon-wasm`). These provide the post-quantum key generation, signing,
and keccak primitives.

In a network-isolated environment those packages cannot be installed, so the JS
suite cannot execute there. In a normal environment install the dependencies and run:

```bash
cd qweb3.js
npm install
npm test
```

The JS metrics script in [`../scripts/metrics_report.js`](../scripts/metrics_report.js)
runs against any environment with the client installed and a reachable endpoint.

## Live network metrics

Live chain figures (observed block time, finality lag, fee tiers, runtime version)
are produced by pointing the metrics scripts at a running endpoint:

```bash
node ../scripts/metrics_report.js --rpc https://mainnet.quantova.io
python ../scripts/metrics_report.py --rpc https://mainnet.quantova.io
```

These scripts are read-only. The target block time is ~2.5 s and target finality is
~3 s (see [../docs/throughput-and-performance.md](../docs/throughput-and-performance.md));
the scripts report the **observed** values against those targets when run against a
live node.

---

*© 2026 Quantova Inc, BUSL-1.1.*
