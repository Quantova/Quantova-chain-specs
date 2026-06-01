# Addressing & Accounts

Quantova has a single account model shared by native runtime transactions and QVM
contract calls. Every account is post-quantum, and every canonical account address
is a fixed-width, scheme-independent identifier derived from a post-quantum public
key.

## 1. Canonical Q-address

A Quantova account address is derived from the account's post-quantum public key:

1. Hash the public key with **SHA3-256**.
2. Take the **first 20 bytes** of the digest as the account body (H160 width).
3. Set the **leading byte to `0x40`**, the fixed "Q" marker in Base64.

The canonical, user-facing form is the **Base64 encoding of those 20 bytes**, which
always begins with `Q`. This holds for all three signature schemes — Dilithium,
Falcon, and SPHINCS+ all derive into the same 20-byte Q-address space.

### Why 20 bytes, not 32

The SHA3-256 digest is 32 bytes, but the address is the first 20 bytes (H160).
Because the leading byte is the fixed Q marker, the address space is unambiguous at
20 bytes, and it matches the H160 width used by the QVM — so native accounts and
contract accounts share one address format.

## 2. Hex is for hashes, not accounts

`0x`-prefixed hex on Quantova denotes values that are **not** accounts — block and
transaction hashes, SHA3-256 digests, and QVM calldata. A `0x...` value is raw
bytes; a `Q...` value is an account. This separation is Quantova's own and is not
inherited from any other ecosystem. The chain property `isEthereum` is `false`.

## 3. Network address format

| Property | Value |
|---|---|
| SS58 format | 42 |
| Token symbol | QTOV (mainnet) / TQTOV (testnet) |
| Token decimals | 18 |
| Canonical address | Base64 H160, leading `Q` |
| H160 width | 20 bytes |
| `isEthereum` | false |

## 4. Choosing a signature scheme

There is **no default** signature algorithm — an account chooses Dilithium, Falcon,
or SPHINCS+ explicitly at creation. All three derive into the same Q-address space,
so the choice does not change how the address looks or how the rest of the protocol
treats the account. See [quantum-security.md](quantum-security.md) for the trade-offs
between the schemes.

```js
// qweb3.js — create a post-quantum account (scheme chosen explicitly)
const { QuantumWallet } = require('qweb3.js');
const wallet = new QuantumWallet();
const account = wallet.create('dilithium'); // 'dilithium' | 'falcon' | 'sphincsp'
console.log(account.address); // canonical Q-address, begins with 'Q'
```
CRYSTALS-Dilithium (ML-DSA), Falcon (FN-DSA), and SPHINCS+ (SLH-DSA, FIPS 205)
```python
# qweb3.py — same, in Python
import qweb3
from qweb3 import crypto_backend, QuantumWallet
crypto_backend.set_backend(backend)        # register the PQ backend once
wallet = QuantumWallet()
account = wallet.create("dilithium")        # 'dilithium' | 'falcon' | 'sphincsp'
print(account.address)                      # canonical Q-address, begins with 'Q'
```

See [connect-and-verify.md](connect-and-verify.md) for the full client setup.

---

*Account model and derivation are drawn from the Quantova runtime
(`primitives/account`) and developer specification. © 2026 Quantova Inc, BUSL-1.1.*
