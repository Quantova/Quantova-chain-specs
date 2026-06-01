# Quantova Chain Specs

Genesis, raw chain specs, bootnodes, public RPC endpoints, and the full
specification for the **Quantova** network — an independent, post-quantum Layer-1
blockchain whose cryptography is quantum-resistant from the signature layer up.

Quantova is not built on classical elliptic-curve cryptography. Every account, every
validator, and every transaction the network will ever process is secured by
NIST-standardized post-quantum signatures. This repository is the canonical source
for connecting to the network and for understanding exactly how that quantum-secure
chain is built.

## Why this is different

- **Post-quantum by construction, not by option.** No ECDSA, no secp256k1, no
  classical fallback anywhere — account authority, consensus authority, and state
  integrity are all post-quantum.
- **NIST algorithms, vetted implementation.** CRYSTALS-Dilithium (ML-DSA), Falcon
  (FN-DSA), and SPHINCS+ (SLH-DSA, FIPS 205), integrated via the Open Quantum Safe
  (liboqs) library, all sharing one address space.
- **Deterministic, fast finality.** NPoS with deterministic round-robin slot
  leadership (no VRF) and deterministic, provable finality with Falcon authority
  keys.
- **No bloat.** Large post-quantum keys do not enlarge addresses, account state, or
  the virtual machine — account identifiers stay a constant 20 bytes and keys live
  in the transaction, not in state.
- **Universal inheritance.** Every pallet, every transaction type, and the QVM
  inherit the post-quantum signature layer automatically.

## Network at a glance

| Metric | Value |
|---|---|
| Native asset / decimals | QTOV / 18 |
| Consensus | NPoS + deterministic round-robin slot leadership (no VRF) |
| Authority key scheme | Falcon (post-quantum) |
| Target block time | ~2.5 s |
| Target finality | ~3 s (deterministic, provable) |
| Active validator cap | 200 |
| Signature schemes | CRYSTALS-Dilithium, Falcon-512, SPHINCS+ (all post-quantum) |
| Block / tx / state hashing | SHA3-256 |
| Address style | Canonical Q-address (Base64 H160, leading `Q`); `isEthereum = false` |
| Genesis supply | 1,050,000,000 QTOV |
| Issuance | Disinflationary 5.0% → 1.5%, no burn |

Throughput is designed for high transaction rates — on the order of thousands of
simple transfers per second on reference validator hardware — with exact figures
dependent on workload and hardware and measurable live via the
[metrics scripts](scripts). See
[throughput-and-performance.md](docs/throughput-and-performance.md).

## Public endpoints

| Environment | WebSocket | HTTP JSON-RPC |
|---|---|---|
| Mainnet | `wss://mainnet.quantova.io` | `https://mainnet.quantova.io` |
| Testnet | `wss://testnet.quantova.io` | `https://testnet.quantova.io` |
| Local dev | `ws://127.0.0.1:9944` | `http://127.0.0.1:9933` |

Connect with Quantova's own client libraries, **qweb3.js** and **qweb3.py** — see
[connect-and-verify.md](docs/connect-and-verify.md).

## Network specs

| Network | Spec | Raw spec | Bootnodes | Endpoints |
|---|---|---|---|---|
| Mainnet | [quantova-mainnet.json](networks/mainnet/quantova-mainnet.json) | [quantova-mainnet.raw.json](networks/mainnet/quantova-mainnet.raw.json) | [bootnodes.txt](networks/mainnet/bootnodes.txt) | [endpoints.md](networks/mainnet/endpoints.md) |
| Testnet | [quantova-testnet.json](networks/testnet/quantova-testnet.json) | [quantova-testnet.raw.json](networks/testnet/quantova-testnet.raw.json) | [bootnodes.txt](networks/testnet/bootnodes.txt) | [endpoints.md](networks/testnet/endpoints.md) |

The raw genesis is a generated, signed artifact produced at launch; see
[chain-specification.md](docs/chain-specification.md) §6 for the generation and
genesis-hash anchoring procedure.

## Documentation

| Document | What it covers |
|---|---|
| [docs/quantum-security.md](docs/quantum-security.md) | The full quantum-secure build: the threat, the NIST algorithm implementation, key sizes and why they do not bloat the chain or the VM, latency, and how every deployment inherits post-quantum security |
| [docs/consensus-and-block-production.md](docs/consensus-and-block-production.md) | NPoS, deterministic slot leadership, finality, block validity rules, and validator/timing metrics |
| [docs/throughput-and-performance.md](docs/throughput-and-performance.md) | Headline metrics, the throughput model, the latency budget, and what stays constant under post-quantum |
| [docs/addressing-and-accounts.md](docs/addressing-and-accounts.md) | Canonical Q-address derivation, SS58, H160, and choosing a signature scheme |
| [docs/chain-specification.md](docs/chain-specification.md) | The complete parameter reference: identity, runtime, consensus, addressing, tokenomics, genesis generation, canonical network definition |
| [docs/connect-and-verify.md](docs/connect-and-verify.md) | Connecting with qweb3.js / qweb3.py and running the live metrics report |

## Scripts & reports

- [scripts/metrics_report.js](scripts/metrics_report.js) and
  [scripts/metrics_report.py](scripts/metrics_report.py) — read-only live metrics
  collectors using qweb3.js / qweb3.py (see [scripts/README.md](scripts/README.md)).
- [reports/tooling-verification.md](reports/tooling-verification.md) — verification
  of the client libraries used here.

## Repository layout

```
chain-specs/
  networks/
    mainnet/   quantova-mainnet.json, quantova-mainnet.raw.json, bootnodes.txt, endpoints.md
    testnet/   quantova-testnet.json, quantova-testnet.raw.json, bootnodes.txt, endpoints.md
  docs/        quantum-security, consensus-and-block-production, throughput-and-performance,
               addressing-and-accounts, chain-specification, connect-and-verify
  scripts/     metrics_report.js, metrics_report.py, README.md
  reports/     tooling-verification.md
  LICENSE      (BUSL-1.1)
  LICENSE-OVERVIEW.md
```

## License

Licensed under the Business Source License 1.1 (BUSL-1.1), © 2026 Quantova Inc.
See [LICENSE](LICENSE) and [LICENSE-OVERVIEW.md](LICENSE-OVERVIEW.md).
