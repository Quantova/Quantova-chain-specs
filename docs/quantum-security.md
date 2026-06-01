# Quantum Security

Quantova is post-quantum from the signature layer up. This is not a compatibility
shim or an optional mode bolted onto a classical chain — it is the foundation of
the account model, the consensus authority keys, and every transaction the network
will ever process. There is no ECDSA, no secp256k1, and no classical-cryptography
fallback anywhere in Quantova.

This document is the full breakdown of how that quantum-secure build is put
together, the NIST algorithms behind it, and why the larger key and signature sizes
of post-quantum cryptography have no measurable effect on the chain, its state
growth, or its virtual machine.

## 1. The threat Quantova is built for

Public-key blockchains authenticate every transaction with elliptic-curve
signatures (ECDSA on secp256k1, or Ed25519). A sufficiently capable quantum
computer running Shor's algorithm breaks those schemes by recovering private keys
from public keys. The danger is not only prospective: a **harvest-now,
decrypt-later** adversary can record on-chain public keys and signatures today and
forge them the moment the hardware exists. Every classical chain's entire history
becomes forgeable retroactively.

Quantova removes that exposure at the root. Account authority, consensus authority,
and state integrity are all anchored in cryptography for which no efficient quantum
attack is known.

## 2. The NIST post-quantum implementation

Quantova standardizes on the three signature schemes selected and standardized
through the NIST Post-Quantum Cryptography process, and integrates them through the
**Open Quantum Safe (liboqs)** implementations — a vetted, widely reviewed
post-quantum library — rather than a bespoke, unaudited crypto stack. All three
schemes share a single Quantova address space, and an account chooses its scheme
explicitly; there is no implicit default and no way to fall back to classical keys.

| Scheme | NIST standard / family | Basis | Role in Quantova |
|---|---|---|---|
| CRYSTALS-Dilithium (Dilithium2 / ML-DSA-44) | FIPS 204 (ML-DSA) | Module-lattice | Balanced signature size and verification speed — the general-purpose default choice for accounts. |
| Falcon-512 (FN-DSA) | NIST PQC (FN-DSA) | NTRU lattice | Compact signatures; also the **validator authority key** scheme for consensus and finality. |
| SPHINCS+ (SLH-DSA, SHA2-128s) | FIPS 205 (SLH-DSA) | Stateless hash-based | The conservative, assumption-minimal option; security rests only on the hash function. |

Hashing across the chain — block hashes, transaction hashes, and the state trie —
uses **SHA3-256 (Keccak family)**, a hash function with no known quantum weakness
beyond the generic Grover speed-up, which is mitigated by the 256-bit digest.

### Why three schemes

Different deployments weigh size, speed, and conservatism differently. Dilithium is
the balanced default; Falcon minimizes signature size and powers consensus;
SPHINCS+ offers hash-based security for parties who want to rely on the fewest
possible assumptions. Because all three resolve into the **same Q-address space**,
this choice is per-account and invisible to the rest of the protocol — and schemes
can be added or retired later through on-chain governance without disrupting the
address space (algorithm agility).

## 3. Key and signature sizes — and why they do not bloat Quantova

Post-quantum keys and signatures are larger than their elliptic-curve counterparts.
The standard sizes for Quantova's selected parameter sets are:

| Scheme | Public key | Signature |
|---|---|---|
| CRYSTALS-Dilithium (Dilithium2) | ~1312 bytes | up to ~2420 bytes |
| Falcon-512 | ~897 bytes | up to ~752 bytes |
| SPHINCS+ (SLH-DSA-128s) | ~32 bytes | ~7856 bytes |

A naive design would let these sizes inflate addresses, account storage, and
contract state. Quantova's account model is engineered specifically so they do not:

- **Account identifiers are a constant 20 bytes.** Every Quantova account address
  is derived as `SHA3-256(public_key)[..20]` with a fixed leading `0x40` ("Q")
  marker — a 20-byte H160, identical in width to an Ethereum-style address,
  **regardless of which post-quantum scheme produced it**. A SPHINCS+ account and a
  Falcon account have the same 20-byte address footprint. The public key itself is
  never the account identifier.
- **Keys and signatures live in the transaction, not in state.** A post-quantum
  public key and signature travel inside the extrinsic that carries a call. They
  are verified on import and then discarded — they are **not** persisted in the
  account or accumulated in the state trie. State growth per account is therefore
  the same as on a classical 20-byte-address chain; the larger PQ artifacts do not
  compound over time.
- **Storage keys and balances are unaffected.** Because the account key is the
  20-byte address, every storage map keyed by account, every balance entry, and
  every nonce is the same size it would be on any H160-addressed chain.

The practical result: post-quantum cryptography raises per-transaction *bandwidth*
modestly (a signature is on the order of hundreds to a few thousand bytes), but it
does **not** enlarge the persistent state, the address space, or the account model.
The one-time transaction cost is absorbed by the block; the long-term state stays
lean.

## 4. No effect on the QVM (virtual machine)

The Quantova Virtual Machine — Solidity-on-QVM via PolkaVM — is unaffected by
post-quantum key sizes:

- The QVM uses standard **20-byte H160 contract addresses** and the standard
  **keccak-256 Solidity ABI** for selectors and event topics. Contract code,
  calldata, and storage layout are byte-for-byte what a Solidity developer expects.
- A contract call is an ordinary post-quantum-signed extrinsic at the transaction
  layer; the signature is verified *before* the call reaches the VM. The VM sees a
  normal 20-byte caller address and standard calldata — it never handles a
  post-quantum key.
- Therefore Solidity tooling, ABIs, and contract state are identical to an
  EVM-style environment, while the transaction authorizing the call is fully
  post-quantum. PQ security and EVM-compatible execution coexist with no trade-off
  inside the VM.

## 5. Latency

Post-quantum verification is fast on commodity validator hardware. Falcon and
Dilithium verification complete in well under the block budget; SPHINCS+ carries a
larger signature but is the conservative option chosen by parties who accept that
trade. Critically:

- Verification happens once per transaction, in parallel with normal block
  processing, against a **~2.5 second** block budget and **~3 second** finality —
  the verification cost is a small fraction of that window.
- Consensus adds **no** randomness-beacon latency: Quantova uses deterministic
  round-robin slot leadership instead of a VRF (see
  [consensus-and-block-production.md](consensus-and-block-production.md)), removing a
  source of latency and a classical cryptographic dependency at once.

Net effect: the move to post-quantum signatures does not measurably slow block
production, finality, or VM execution.

## 6. Every deployment inherits quantum security

Quantova's post-quantum protection is defined at the lowest layers of the runtime —
the signature type and the hashing algorithm — so it is inherited by everything
built above it, with no opt-out:

- **Every transaction type is post-quantum signed by construction.** Transfers,
  staking, governance votes, QNS naming operations, bridge operations, and QVM
  contract calls are all signed extrinsics whose signature type is `QSignature`.
  There is no transaction path that uses classical cryptography.
- **Every account is post-quantum.** The chain's account identity *is* the
  post-quantum public key (via the 20-byte derivation). You cannot hold or move
  value on Quantova with a classical key.
- **Every runtime and pallet inherits it.** Because the runtime fixes
  `Signature = QSignature` and `Hashing = SHA3-256` once, any pallet — existing or
  future — is post-quantum secured automatically. Modules do not implement their own
  signature scheme.
- **The consensus layer inherits it.** Validator authority keys are Falcon, so
  block production and finality are themselves post-quantum, not just user
  transactions.
- **The QVM inherits it.** Contract deployment and calls are PQ-signed extrinsics,
  so smart-contract activity is secured by the same post-quantum layer as native
  transactions while retaining EVM-compatible execution.

In short: post-quantum security on Quantova is not a feature you opt into per
application — it is a property of the chain that every deployment receives by
default.

## 7. Canonical identifiers

For network-identity and authorization purposes, the canonical Quantova network is
defined by its **post-quantum genesis hash** together with the signed runtime and
protocol artifacts and the CRYSTALS-Dilithium and Falcon signatures over them. See
[chain-specification.md](chain-specification.md) for the genesis-hash anchoring and
[../README.md](../README.md) for the network endpoints.

---

*Algorithm parameters and sizes correspond to the NIST parameter sets named above
(ML-DSA-44 / Falcon-512 / SLH-DSA-SHA2-128s) as implemented via Open Quantum Safe
(liboqs). Protocol values are drawn from the Quantova runtime and developer
specification. © 2026 Quantova Inc, BUSL-1.1.*
