#!/usr/bin/env node
/**
 * Quantova chain metrics report — qweb3.js
 *
 * Collects a read-only performance and identity snapshot from a Quantova endpoint
 * using the official qweb3.js client. It samples twice over a short interval to
 * derive observed block time and finality lag. It signs nothing and submits nothing.
 *
 * Usage:
 *   node metrics_report.js --rpc https://mainnet.quantova.io
 *   node metrics_report.js --rpc https://testnet.quantova.io --interval 10
 *   node metrics_report.js --rpc http://127.0.0.1:9933
 *
 * Requires: npm install qweb3.js
 */

const { QWeb3 } = require('qweb3.js');

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const RPC = arg('rpc', 'https://mainnet.quantova.io');
const INTERVAL = parseInt(arg('interval', '8'), 10);

const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
const toNum = (v) => (typeof v === 'string' && v.startsWith('0x') ? parseInt(v, 16) : Number(v));

async function main() {
  const q = new QWeb3(RPC);
  console.log(`Quantova metrics report (qweb3.js)`);
  console.log(`Endpoint: ${RPC}`);
  console.log('-'.repeat(60));

  // Identity / runtime
  try {
    const rv = await q.rpc.call('state_getRuntimeVersion', []);
    console.log(`Runtime         : ${rv.specName} v${rv.specVersion} (tx v${rv.transactionVersion})`);
  } catch (e) { console.log(`Runtime         : (unavailable: ${e.message})`); }

  // Sample 1
  const b1 = toNum(await q.rpc.blockNumber());
  let f1 = null;
  try { f1 = toNum((await q.rpc.call('chain_getHeader', [await q.rpc.call('chain_getFinalizedHead', [])])).number); } catch (_) {}
  const t1 = Date.now();

  await sleep(INTERVAL);

  // Sample 2
  const b2 = toNum(await q.rpc.blockNumber());
  let f2 = null;
  try { f2 = toNum((await q.rpc.call('chain_getHeader', [await q.rpc.call('chain_getFinalizedHead', [])])).number); } catch (_) {}
  const t2 = Date.now();

  const elapsed = (t2 - t1) / 1000;
  const blocks = b2 - b1;
  const blockTime = blocks > 0 ? (elapsed / blocks).toFixed(2) : 'n/a';

  console.log(`Best block      : ${b1} -> ${b2}  (+${blocks} in ~${elapsed.toFixed(0)}s)`);
  console.log(`Observed block time: ~${blockTime}s  (target ~2.5s)`);
  if (f2 !== null) {
    console.log(`Finalized head  : ${f1} -> ${f2}`);
    console.log(`Finality lag    : ${b2 - f2} blocks behind best`);
  }

  // Fees
  try {
    const fees = await q.fees.estimate();
    console.log(`Fee tiers       : slow=${fees.tiers.slow} standard=${fees.tiers.standard} fast=${fees.tiers.fast} (${fees.model})`);
  } catch (e) { console.log(`Fee tiers       : (unavailable: ${e.message})`); }

  console.log('-'.repeat(60));
  console.log('Read-only snapshot complete. No transactions were sent.');
}

main().catch((e) => { console.error('error:', e.message); process.exit(1); });
