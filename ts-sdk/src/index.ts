import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import idl from "./idl/payment_processor.json";
import type { PaymentProcessor } from "./idl/payment_processor";

export default {
    idlJson: idl,
    idlType: null as unknown as PaymentProcessor,

    create(provider: anchor.Provider, program: Program<PaymentProcessor>) {
        const payer = provider.publicKey!;
        // Helper to read byte-array constants straight from the program IDL
        function getConstant(name: string): Uint8Array {
            return JSON.parse(
                idl.constants.find((obj: { name: string }) => obj.name === name)!.value,
            );
        }

        const GLOBAL_CONFIG_SEED = getConstant("GLOBAL_CONFIG_SEED");
        const PAYMENT_SEED = getConstant("PAYMENT_SEED");

        function getGlobalConfigPda(): [PublicKey, number] {
            return PublicKey.findProgramAddressSync(
                [Buffer.from(GLOBAL_CONFIG_SEED)],
                program.programId,
            );
        }

        function getPaymentTypePda(paymentType: string): [PublicKey, number] {
            return PublicKey.findProgramAddressSync(
                [
                    Buffer.from(PAYMENT_SEED),
                    Buffer.from(paymentType),
                ],
                program.programId,
            );
        }

        async function initialize(newAdmin: PublicKey): Promise<{ signature: string; globalConfigPda: PublicKey }> {
            const [globalConfigPda] = getGlobalConfigPda();

            const signature = await program.methods
                .initialize(newAdmin)
                .accountsStrict({
                    globalConfig: globalConfigPda,
                    admin: payer,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            return { signature, globalConfigPda };
        }

        async function setPaymentType(args: {
            paymentTypeName: string;
            amount: anchor.BN;
            token: PublicKey;
        }): Promise<{ signature: string; paymentTypePda: PublicKey }> {
            const [paymentTypePda] = getPaymentTypePda(args.paymentTypeName);
            const [globalConfigPda] = getGlobalConfigPda();

            const signature = await program.methods
                .setPaymentType(
                    args.paymentTypeName,
                    args.amount,
                    args.token,
                )
                .accountsStrict({
                    globalConfig: globalConfigPda,
                    paymentType: paymentTypePda,
                    admin: payer,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            return { signature, paymentTypePda };
        }

        async function pay(args: {
            paymentTypeName: string;
            amount: anchor.BN | number;
            agentWallet: PublicKey;
            paymentId: Uint8Array | number[] | Buffer;
            payerAta?: PublicKey;
            receiverToken?: PublicKey;
        }): Promise<{ signature: string }> {
            const { paymentType: paymentType } = await getPaymentType(args.paymentTypeName);
            if (!paymentType) throw new Error("Payment type not found");

            const token = paymentType.token as PublicKey;
            const agentWallet = args.agentWallet;

            const userToken =
                args.payerAta ??
                getAssociatedTokenAddressSync(token, payer);

            const receiverToken =
                args.receiverToken ??
                getAssociatedTokenAddressSync(token, agentWallet, true);

            const [globalConfigPda] = getGlobalConfigPda();
            const [paymentTypePda] = getPaymentTypePda(args.paymentTypeName);

            const pid =
                Buffer.isBuffer(args.paymentId)
                    ? args.paymentId
                    : Buffer.from(args.paymentId);

            if (pid.length !== 32)
                throw new Error("paymentId must be exactly 32 bytes");

            const signature = await program.methods
                .pay(
                    args.paymentTypeName,
                    new anchor.BN(args.amount),
                    Array.from(pid) as number[],
                )
                .accountsStrict({
                    globalConfig: globalConfigPda,
                    paymentType: paymentTypePda,
                    payerAta: userToken,
                    agentWallet,
                    agentAta: receiverToken,
                    payer,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            return { signature };
        }

        async function getGlobalConfig(): Promise<{
            globalConfigPda: PublicKey;
            globalConfig: any | null;
        }> {
            const [pda] = getGlobalConfigPda();
            try {
                const data = await program.account.globalConfig.fetch(pda);
                return { globalConfigPda: pda, globalConfig: data };
            } catch {
                return { globalConfigPda: pda, globalConfig: null };
            }
        }

        async function getPaymentType(paymentTypeName: string) {
            const [pda] = getPaymentTypePda(paymentTypeName);
            try {
                const data = await program.account.paymentType.fetch(pda);
                return { paymentTypePda: pda, paymentType: data };
            } catch {
                return { paymentTypePda: pda, paymentType: null };
            }
        }

        return {
            getGlobalConfigPda,
            getPaymentTypePda,
            initialize,
            setPaymentType,
            pay,
            getGlobalConfig,
            getPaymentType,
        };
    },
};

export type { PaymentProcessor };

// Explicit named export for the SDK functions for proper typing
export const xyberPaymentProcessorSdk = {
    idlJson: idl,
    idlType: null as unknown as PaymentProcessor,
    create: (provider: anchor.Provider, program: Program<PaymentProcessor>) =>
        exports.default.create(provider, program),
};
