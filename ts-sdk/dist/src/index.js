"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xyberPaymentProcessorSdk = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const payment_processor_json_1 = __importDefault(require("./idl/payment_processor.json"));
exports.default = {
    idlJson: payment_processor_json_1.default,
    idlType: null,
    create(provider, program) {
        const payer = provider.publicKey;
        // Helper to read byte-array constants straight from the program IDL
        function getConstant(name) {
            return JSON.parse(payment_processor_json_1.default.constants.find((obj) => obj.name === name).value);
        }
        const GLOBAL_CONFIG_SEED = getConstant("GLOBAL_CONFIG_SEED");
        const OPERATION_SEED = getConstant("OPERATION_SEED");
        function getGlobalConfigPda() {
            return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(GLOBAL_CONFIG_SEED)], program.programId);
        }
        function getPaymentTypePda(paymentType) {
            return web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from(OPERATION_SEED),
                Buffer.from(paymentType),
            ], program.programId);
        }
        function initialize(newAdmin) {
            return __awaiter(this, void 0, void 0, function* () {
                const [globalConfigPda] = getGlobalConfigPda();
                const signature = yield program.methods
                    .initialize(newAdmin)
                    .accountsStrict({
                    globalConfig: globalConfigPda,
                    admin: payer,
                    systemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return { signature, globalConfigPda };
            });
        }
        function setPaymentType(args) {
            return __awaiter(this, void 0, void 0, function* () {
                const [operationPda] = getPaymentTypePda(args.paymentType);
                const [globalConfigPda] = getGlobalConfigPda();
                const signature = yield program.methods
                    .setPaymentType(args.paymentType, args.amount, args.token)
                    .accountsStrict({
                    globalConfig: globalConfigPda,
                    paymentType: operationPda,
                    admin: payer,
                    systemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return { signature, operationPda };
            });
        }
        function pay(args) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { operation: payment_type } = yield getOperation(args.paymentType);
                if (!payment_type)
                    throw new Error("Operation not found");
                const token = payment_type.token;
                const agentWallet = args.agentWallet;
                const userToken = (_a = args.payerAta) !== null && _a !== void 0 ? _a : (0, spl_token_1.getAssociatedTokenAddressSync)(token, payer);
                const receiverToken = (_b = args.receiverToken) !== null && _b !== void 0 ? _b : (0, spl_token_1.getAssociatedTokenAddressSync)(token, agentWallet, true);
                const [globalConfigPda] = getGlobalConfigPda();
                const [operationPda] = getPaymentTypePda(args.paymentType);
                const pid = Buffer.isBuffer(args.paymentId)
                    ? args.paymentId
                    : Buffer.from(args.paymentId);
                if (pid.length !== 32)
                    throw new Error("paymentId must be exactly 32 bytes");
                const signature = yield program.methods
                    .pay(args.paymentType, new anchor.BN(args.price), Array.from(pid))
                    .accountsStrict({
                    globalConfig: globalConfigPda,
                    paymentType: operationPda,
                    payerAta: userToken,
                    agentWallet,
                    agentAta: receiverToken,
                    payer,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                })
                    .rpc();
                return { signature };
            });
        }
        function getGlobalConfig() {
            return __awaiter(this, void 0, void 0, function* () {
                const [pda] = getGlobalConfigPda();
                try {
                    const data = yield program.account.globalConfig.fetch(pda);
                    return { globalConfigPda: pda, globalConfig: data };
                }
                catch (_a) {
                    return { globalConfigPda: pda, globalConfig: null };
                }
            });
        }
        function getOperation(paymentType) {
            return __awaiter(this, void 0, void 0, function* () {
                const [pda] = getPaymentTypePda(paymentType);
                try {
                    const data = yield program.account.paymentType.fetch(pda);
                    return { operationPda: pda, operation: data };
                }
                catch (_a) {
                    return { operationPda: pda, operation: null };
                }
            });
        }
        return {
            getGlobalConfigPda,
            getPaymentTypePda,
            initialize,
            setPaymentType,
            pay,
            getGlobalConfig,
            getOperation,
        };
    },
};
// Explicit named export for the SDK functions for proper typing
exports.xyberPaymentProcessorSdk = {
    idlJson: payment_processor_json_1.default,
    idlType: null,
    create: (provider, program) => exports.default.create(provider, program),
};
