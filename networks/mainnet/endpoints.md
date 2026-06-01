# Quantova Mainnet — Endpoints & Network Details

| Field | Value |
|---|---|
| Network name | Quantova Mainnet |
| Chain id | `quantova_mainnet` |
| Protocol id | `qtov` |
| Native asset | QTOV |
| Decimals | 18 |
| SS58 format | 42 |
| Address style | Canonical Q-address (Base64 H160, leading `Q`); `isEthereum = false` |
| State / tx / block hashing | SHA3-256 |
| Consensus | NPoS + deterministic round-robin slot leadership (no VRF) |
| Authority key scheme | Falcon (post-quantum) |
| Target block time | ~2.5 s |
| Target finality | ~3 s (deterministic, provable) |
| Active validator cap | 200 |

## RPC endpoints

| Transport | URL |
|---|---|
| WebSocket | `wss://mainnet.quantova.io` |
| HTTP JSON-RPC | `https://mainnet.quantova.io` |
| Local dev (node default) | `ws://127.0.0.1:9944` / `http://127.0.0.1:9933` |

RPC exposes Quantova's `q_*` namespace plus the standard Substrate `state_*`,
`chain_*`, and `system_*` methods. A REST gateway mirrors reads under `/v1`. See
[../../docs/connect-and-verify.md](../../docs/connect-and-verify.md) for connecting
with qweb3.js and qweb3.py.

## Genesis

The raw genesis is a generated, signed artifact. Produce and verify it with:

```bash
# Generate the raw chain spec from the signed runtime + genesis config
quantova-node build-spec --chain quantova_mainnet --raw > quantova-mainnet.raw.json

# The genesis hash anchors network identity; read it from a synced node:
#   state_getBlockHash(0)  /  chain_getBlockHash(0)
```

Network identity is defined by the post-quantum genesis hash together with the
signed runtime and protocol artifacts (see
[../../docs/chain-specification.md](../../docs/chain-specification.md)).
