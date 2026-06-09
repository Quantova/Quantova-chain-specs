# Chain Specification

The complete parameter reference for the Quantova network: identity, runtime,
consensus, addressing, tokenomics, and how the genesis artifact is generated and
anchored. The machine-readable specs live in [`../networks`](../networks); this
document is the human-readable companion.

## 1. Network identity

| Field | Mainnet | Testnet |
|---|---|---|
| Name | Quantova Mainnet | Quantova Testnet |
| Chain id | `quantova_mainnet` | `quantova_testnet` |
| Protocol id | `qtov` | `qtov-testnet` |
| Chain type | Live | Live |
| Native asset | QTOV | TQTOV (free, no value) |
| Decimals | 18 | 18 |
| SS58 format | 42 | 42 |
| `isEthereum` | false | false |
| WebSocket | `wss://mainnet.quantova.io` | `wss://testnet.quantova.io` |
| HTTP JSON-RPC | `https://mainnet.quantova.io` | `https://testnet.quantova.io` |
| Local dev | `ws://127.0.0.1:9944` / `http://127.0.0.1:9933` | same |

## 2. Runtime

| Field | Value |
|---|---|
| Spec name | `quantova-runtime` |
| Impl name | `quantova-runtime` |
| Spec version | 1 |
| Authoring version | 1 |
| Transaction version | 1 |
| State / tx / block hashing | SHA3-256 |
| Signature type | `QSignature` (Dilithium / Falcon / SPHINCS+) |

## 3. Consensus

| Field | Value |
|---|---|
| Model | NPoS + deterministic round-robin slot leadership (no VRF) |
| Authority key scheme | Falcon (post-quantum) |
| Finality | Deterministic, provable |
| Target block time | ~2.5 s |
| Target finality | ~3 s |
| Active validator cap | 200 |

Full detail in [consensus-and-block-production.md](consensus-and-block-production.md).

## 4. Addressing

| Field | Value |
|---|---|
| Canonical address | Bech32m, leading `Q1` |
| Derivation | `SHA3-256(public_key)[..20]`, leading byte `0x40` |
| H160 width | 20 bytes |
| Hex `0x...` | Reserved for hashes / calldata, never accounts |

Full detail in [addressing-and-accounts.md](addressing-and-accounts.md).

## 5. Tokenomics (summary)

| Field | Value |
|---|---|
| Native asset | QTOV |
| Decimals | 18 |
| Genesis supply | 1,050,000,000 QTOV |
| Issuance | Uncapped, disinflationary: 5.0% → 1.5% (hardcoded schedule) |
| Fee policy | Collected to treasury and validators; no burn |
| Transaction fee | ~$0.05–$0.10 equivalent |

Governance participation bonds and lock-ups are specified in the
[quantova-governance](https://github.com/Quantova/quantova-governance) repository.

## 6. Genesis generation & anchoring

A chain spec's genesis is a **generated, signed artifact** — it is not hand-authored.
The human-readable spec files in [`../networks`](../networks) carry the network
identity and properties; the raw genesis state is produced at launch and committed
as `quantova-<network>.raw.json`.

```bash
# 1. Generate the raw chain spec from the signed runtime + genesis configuration
quantova-node build-spec --chain quantova_mainnet --raw > quantova-mainnet.raw.json

# 2. Start a node against the spec
quantova-node --chain ./networks/mainnet/quantova-mainnet.raw.json

# 3. Read the genesis hash (anchors network identity) from a synced node
#    via JSON-RPC: chain_getBlockHash(0)  /  state_getBlockHash(0)
```

The raw genesis maps SCALE-encoded storage keys to values and embeds the signed
runtime code under the `:code` key.

## 7. Canonical network definition

For licensing and authorization purposes, the canonical Quantova network is defined
by all of the following:

- Official signed source releases published by Quantova Inc.
- A unique **post-quantum genesis hash**.
- Signed runtime and protocol artifacts.
- Post-quantum cryptographic signatures, including CRYSTALS-Dilithium and Falcon.

Any deployment that does not match these identifiers is not the Quantova network.

---

*Values are drawn from the Quantova runtime, chain specification, and developer
documentation. © 2026 Quantova Inc, BUSL-1.1.*
