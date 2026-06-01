# Metrics scripts

Read-only scripts that collect a live performance and identity snapshot from a
Quantova endpoint using the official client libraries. They sign nothing and submit
nothing.

| Script | Library | Run |
|---|---|---|
| `metrics_report.js` | qweb3.js | `node metrics_report.js --rpc <endpoint>` |
| `metrics_report.py` | qweb3.py | `python metrics_report.py --rpc <endpoint>` |

Endpoints:

- Mainnet: `https://mainnet.quantova.io`
- Testnet: `https://testnet.quantova.io`
- Local:   `http://127.0.0.1:9933`

Optional `--interval <seconds>` sets the gap between the two samples used to derive
observed block time and finality lag (default 8).

Install the client first: `npm install qweb3.js` or `pip install qweb3`. See
[../docs/connect-and-verify.md](../docs/connect-and-verify.md).
