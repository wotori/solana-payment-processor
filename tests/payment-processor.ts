import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";

import type { PaymentProcessor } from "@xyber-labs/payment-sdk";
import processorSdk from "@xyber-labs/payment-sdk";

import { expect } from "chai";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace
  .PaymentProcessor as Program<PaymentProcessor>;

const sdk = processorSdk.create(provider, program);

describe("payment‑processor (SDK)", () => {
  let token: PublicKey;
  let agentWallet: Keypair;

  before(async () => {
    // Create a dummy SPL‑Token mint we will use for all tests (6 decimals).
    token = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      6,
    );

    // Generate an off‑program wallet that will ultimately receive funds.
    agentWallet = Keypair.generate();

    // Fund the agent wallet so it can pay rent for its ATA if needed.
    await provider.connection.requestAirdrop(agentWallet.publicKey, 1e9);
  });

  it("initializes the global config via SDK", async () => {
    const { signature } = await sdk.initialize(provider.publicKey);
    console.log("initialize tx:", signature);

    const { globalConfig } = await sdk.getGlobalConfig();
    if (!globalConfig) throw new Error("GlobalConfig not found after init");

    expect(globalConfig.admin.toBase58()).to.equal(provider.publicKey.toBase58());
  });

  it("registers an payment type via SDK", async () => {
    const paymentTypeName = "prompt"
    const amount = new anchor.BN(2_000_000); // 2 tokens

    const { signature } = await sdk.setPaymentType({
      paymentTypeName,
      amount,
      token,
    });
    console.log("setPaymentType tx:", signature);

    const { paymentType } = await sdk.getPaymentType(paymentTypeName);
    if (!paymentType) throw new Error("payment not found");

    expect(paymentType.amount.toNumber()).to.equal(
      amount.toNumber(),
    );
    expect(paymentType.token.toBase58()).to.equal(token.toBase58());
  });

  it("processes a payment and transfers funds", async () => {
    const paymentTypeName = "prompt"; // the one we registered above
    const paymentId = Uint8Array.from(Array(32).fill(7)); // arbitrary 32‑byte id

    // --- create actual on‑chain token accounts ---
    const { paymentType } = await sdk.getPaymentType(paymentTypeName);
    if (!paymentType) throw new Error("Payment type not found");
    const token = paymentType.token as PublicKey;

    const userAta = await createAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,          // payer of rent / fees
      token,                   // mint
      provider.wallet.publicKey,      // owner
    );

    const receiverAta = await createAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,          // payer
      token,
      agentWallet.publicKey,          // owner (agent)
    );

    // Mint 5 tokens to the user so they can pay (5 * 10^6)
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      token,
      userAta,
      provider.wallet.publicKey,
      5_000_000,
    );

    const userBalBefore = (await getAccount(provider.connection, userAta)).amount;
    const receiverBalBefore = (await getAccount(provider.connection, receiverAta)).amount;

    const { signature } = await sdk.pay({
      paymentTypeName,
      amount: 2_000_000, // must match paymentType.price
      agentWallet: agentWallet.publicKey,
      paymentId,
      payerAta: userAta,
      receiverToken: receiverAta,
    });
    console.log("pay tx:", signature);

    const userBalAfter = (await getAccount(provider.connection, userAta)).amount;
    const receiverBalAfter = (await getAccount(provider.connection, receiverAta)).amount;

    // We registered price = 2_000_000 (2 tokens)
    expect(BigInt(userBalBefore) - BigInt(userBalAfter)).to.equal(2_000_000n);
    expect(BigInt(receiverBalAfter) - BigInt(receiverBalBefore)).to.equal(2_000_000n);
  });
});

it("re-initializes the global config with same admin", async () => {
  const { signature } = await sdk.initialize(provider.publicKey);
  console.log("re-initialize tx:", signature);

  const { globalConfig } = await sdk.getGlobalConfig();
  if (!globalConfig) throw new Error("GlobalConfig not found after re-init");

  expect(globalConfig.admin.toBase58()).to.equal(provider.publicKey.toBase58());
});
