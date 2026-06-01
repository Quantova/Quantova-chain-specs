# Connect & Verify

Quantova is accessed through its own official client libraries — **qweb3.js**
(JavaScript / TypeScript) and **qweb3.py** (Python). This page shows how to point
them at a network from this repository and how to run the included metric scripts to
pull live chain figures (block time, finality lag, runtime version, fees).

## 1. Endpoints

| Environment | WebSocket | HTTP JSON-RPC |
|---|---|---|
| Mainnet | `wss://mainnet.quantova.io` | `https://mainnet.quantova.io` |
| Testnet | `wss://testnet.quantova.io` | `https://testnet.quantova.io` |
| Local dev | `ws://127.0.0.1:9944` | `http://127.0.0.1:9933` |

## 2. qweb3.js

```bash
npm install qweb3.js
```

```js
const { QWeb3 } = require('qweb3.js');

// Mainnet over HTTP JSON-RPC
const q = new QWeb3('https://mainnet.quantova.io');

const block = await q.rpc.blockNumber();
const fees  = await q.fees.estimate();
console.log({ block, standardTip: fees.tiers.standard });
```

## 3. qweb3.py

```bash
pip install qweb3
```

```python
from qweb3 import QWeb3

q = QWeb3("https://mainnet.quantova.io")
print("block:", q.rpc.block_number())
print("fees :", q.fees.estimate()["tiers"]["standard"])
```

## 4. Run the metrics report

Two ready-to-run scripts in [`../scripts`](../scripts) collect a live performance and
identity snapshot using the client libraries above:

```bash
# JavaScript (qweb3.js)
node ../scripts/metrics_report.js --rpc https://mainnet.quantova.io

# Python (qweb3.py)
python ../scripts/metrics_report.py --rpc https://mainnet.quantova.io
```

Each script samples the chain twice over a short interval and reports:

- current block number and finalized head,
- observed block time and finality lag (derived from the two samples),
- runtime spec name and version,
- fee tiers,
- chain properties (token symbol, decimals, SS58 format).

Point `--rpc` at `https://testnet.quantova.io` or `http://127.0.0.1:9933` to profile
the testnet or a local node. The scripts read only — they sign nothing and submit
nothing.

## 5. Tooling verification

The client libraries ship their own offline test suites. A verification run is
recorded in [`../reports/tooling-verification.md`](../reports/tooling-verification.md).

---

*© 2026 Quantova Inc, BUSL-1.1.*
