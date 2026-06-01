# Throughput & Performance

This document sets out Quantova's performance envelope: block production cadence,
finality latency, the throughput model, and how post-quantum cryptography fits
inside that budget. Firm protocol values are stated as such; throughput figures
that depend on hardware and workload are labeled as engineering targets to be
confirmed by benchmarking on reference validator hardware.

## 1. Headline metrics

| Metric | Value | Type |
|---|---|---|
| Target block time | ~2.5 s | Protocol target |
| Target finality | ~3 s, deterministic & provable | Protocol target |
| Finality style | Single-block-range, irreversible once finalized | Protocol |
| Slot leadership | Deterministic round-robin (no VRF) | Protocol |
| Active validator cap | 200 | Protocol |
| Native asset / decimals | QTOV / 18 | Protocol |
| Block / tx / state hashing | SHA3-256 | Protocol |
| Signature verification | Falcon / Dilithium / SPHINCS+ (post-quantum) | Protocol |

## 2. The throughput model

Throughput on Quantova is governed by three levers:

1. **Block time** — the network targets a **~2.5 second** block, so blocks are
   produced roughly every 2.5 seconds on the canonical schedule.
2. **Per-block capacity** — each block has a fixed weight and length budget; the
   number of transactions it admits is that budget divided by the per-transaction
   cost (a simple transfer is far cheaper than a complex contract call).
3. **Parallelizable verification** — post-quantum signature verification is
   independent per transaction and is performed alongside normal block processing,
   so it scales with validator CPU rather than serializing block production.

Effective throughput is therefore *(transactions admitted per block) ÷ (block
time)*. Because per-transaction cost varies widely between a balance transfer and a
heavy QVM call, Quantova characterizes throughput as a **target envelope** rather
than a single fixed number: the design targets **high transaction throughput — on
the order of thousands of simple transfers per second on reference validator
hardware** — with the exact figure dependent on the per-block weight budget,
transaction mix, and hardware, and confirmed by benchmarking. Quantova does not
publish a single guaranteed TPS headline number in place of measured results; the
[connect-and-verify](connect-and-verify.md) scripts let anyone measure live
block-fill and transaction rates against a running endpoint.

## 3. Latency budget and post-quantum cost

The end-to-end latency a user experiences is dominated by block time and finality,
not by signature verification:

- A transaction is included in the next available block (~2.5 s cadence) and
  reaches deterministic finality at ~3 s.
- Post-quantum verification (Falcon, Dilithium) completes in a small fraction of the
  block budget on commodity hardware; SPHINCS+ uses a larger signature and is the
  conservative option chosen per-account.
- Deterministic slot leadership adds **no** VRF/randomness-beacon latency — a source
  of delay present in classical VRF-based consensus is simply absent.

The signature size affects per-transaction **bandwidth** (hundreds to a few thousand
bytes), not finality time and not persistent state size — see
[quantum-security.md](quantum-security.md) §3–§5 for why key sizes do not bloat the
chain or the VM.

## 4. What stays constant under post-quantum

| Concern | Impact of post-quantum cryptography |
|---|---|
| Account address size | None — constant 20-byte H160 regardless of scheme |
| Persistent state growth per account | None — keys/signatures live in the transaction, not state |
| QVM contract addresses, ABI, calldata | None — standard 20-byte H160 + keccak ABI |
| Finality time | None — absorbed by the ~3 s finality budget |
| Per-transaction bandwidth | Modest, one-time increase (the signature) |

## 5. Measuring it yourself

The scripts in [`../scripts`](../scripts) use Quantova's own client libraries —
**qweb3.js** and **qweb3.py** — to pull live performance signals from any endpoint:
block number and finalized head over an interval (to derive block time and finality
lag), the runtime version, fee tiers, and validator counts. Point them at
`wss://mainnet.quantova.io`, `wss://testnet.quantova.io`, or a local node to produce
a live metrics report. See [connect-and-verify.md](connect-and-verify.md).

---

*Protocol targets are drawn from the Quantova runtime and developer specification.
Throughput figures are engineering targets pending benchmarking; measure live values
with the provided scripts. © 2026 Quantova Inc, BUSL-1.1.*
