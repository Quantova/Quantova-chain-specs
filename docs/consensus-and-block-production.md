# Consensus & Block Production

Quantova's consensus layer is Nominated Proof-of-Stake with **deterministic
round-robin slot leadership** and **deterministic, provable finality** — and it is
post-quantum: validator authority keys are Falcon. This removes the
quantum-vulnerable randomness (VRF) that classical Substrate-style consensus depends
on, while keeping fast, predictable block production and irreversible finality.

## 1. Three properties of the consensus layer

1. **Stake-weighted validator selection (NPoS).** Validators bond QTOV and are
   backed by nominators; the active set is chosen by stake.
2. **Deterministic slot leadership (no VRF).** Slot assignment is round-robin,
   deterministic, and predictable — the eligible author for each slot is fixed by
   the active validator order. There is no per-slot random draw and no verifiable
   random function.
3. **Deterministic, provable finality with post-quantum authority keys.** The
   validator set votes to finalize a single canonical chain using Falcon
   (post-quantum) authority keys. Once finalized, a block is irreversible unless a
   supermajority of validators violates protocol assumptions.

## 2. Block production

Block production is slot-based. In each slot the scheduled validator authors a
block, which is gossiped and imported. Because leadership is deterministic, peers
independently verify that the author was the legitimate validator for that slot —
they check the fixed slot-to-author mapping rather than a randomized eligibility
proof. This makes block validity cheap to verify and removes a classical
cryptographic dependency.

## 3. Block validity rules

A block is accepted by honest nodes only if all of the following hold:

- **Authorship** — the author is the validator assigned to that slot by the
  deterministic round-robin schedule over the active set.
- **Post-quantum transaction validity** — every extrinsic in the block carries a
  valid `QSignature` (Dilithium, Falcon, or SPHINCS+), and the account derived from
  the signing public key matches the signer. Any invalid signature invalidates the
  block.
- **State-root integrity** — re-executing the block reproduces the SHA3-256 state
  root committed in the header.
- **Parent and ordering** — the block extends a known parent and respects nonce
  ordering per account.
- **Weight / length bounds** — the block stays within the runtime's per-block
  weight and length budget.

Finality is then applied on top: the validator set's Falcon-signed votes commit a
single canonical chain, after which the block cannot be reverted.

## 4. Validator set & timing metrics

| Parameter | Value |
|---|---|
| Consensus | NPoS + deterministic round-robin slot leadership (no VRF) |
| Authority key scheme | Falcon (post-quantum) |
| Finality | Deterministic, provable |
| Target block time | ~2.5 s |
| Target finality | ~3 s |
| Active validator cap | 200 (target at maturity) |
| Minimum self-stake | $50,000 USD-equivalent in QTOV |
| Epoch length | 24 hours |
| Uptime requirement | 95% per epoch |
| Unbonding period | 14 days |
| Redelegation cooldown | 7 days |
| Maximum commission | 25% |
| Block / tx / state hashing | SHA3-256 |

The minimum self-stake is a deliberate Sybil-resistance control: requiring
substantial capital per validator makes it expensive to register many nodes to
concentrate stake, and it is a protocol parameter that governance can change only
through a high-threshold critical referendum — never by an operator decision.

## 5. Two execution planes, one finality

Quantova runs two execution planes over one account model: native runtime
extrinsics (transfers, staking, governance, naming, bridge) and QVM smart-contract
calls via the `q_*` namespace. **Both are post-quantum signed and reach the same
deterministic finality** — there is no weaker path for contract activity than for
native transactions.

---

*Protocol values are drawn from the Quantova runtime and developer specification
(Consensus & Finality, Staking & Validator Economics). © 2026 Quantova Inc,
BUSL-1.1.*
