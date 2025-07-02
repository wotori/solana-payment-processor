import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { PaymentProcessor } from "./idl/payment_processor";
declare const _default: {
    idlJson: {
        address: string;
        metadata: {
            name: string;
            version: string;
            spec: string;
            description: string;
        };
        instructions: ({
            name: string;
            docs: string[];
            discriminator: number[];
            accounts: ({
                name: string;
                writable: boolean;
                signer: boolean;
                pda?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                pda: {
                    seeds: {
                        kind: string;
                        value: number[];
                    }[];
                };
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                address: string;
                writable?: undefined;
                signer?: undefined;
                pda?: undefined;
            })[];
            args: {
                name: string;
                type: string;
            }[];
        } | {
            name: string;
            docs: string[];
            discriminator: number[];
            accounts: ({
                name: string;
                pda: {
                    seeds: ({
                        kind: string;
                        value: number[];
                        path?: undefined;
                    } | {
                        kind: string;
                        path: string;
                        value?: undefined;
                    })[];
                };
                writable?: undefined;
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                pda?: undefined;
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                pda?: undefined;
                writable?: undefined;
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                signer: boolean;
                pda?: undefined;
                address?: undefined;
            } | {
                name: string;
                address: string;
                pda?: undefined;
                writable?: undefined;
                signer?: undefined;
            })[];
            args: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    array: (string | number)[];
                };
            })[];
        } | {
            name: string;
            docs: string[];
            discriminator: number[];
            accounts: ({
                name: string;
                writable: boolean;
                pda: {
                    seeds: ({
                        kind: string;
                        value: number[];
                        path?: undefined;
                    } | {
                        kind: string;
                        path: string;
                        value?: undefined;
                    })[];
                };
                signer?: undefined;
                relations?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                signer: boolean;
                relations: string[];
                pda?: undefined;
                address?: undefined;
            } | {
                name: string;
                address: string;
                writable?: undefined;
                pda?: undefined;
                signer?: undefined;
                relations?: undefined;
            })[];
            args: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    option: string;
                };
            })[];
        })[];
        accounts: {
            name: string;
            discriminator: number[];
        }[];
        events: {
            name: string;
            discriminator: number[];
        }[];
        errors: {
            code: number;
            name: string;
            msg: string;
        }[];
        types: ({
            name: string;
            type: {
                kind: string;
                fields: ({
                    name: string;
                    type: string;
                } | {
                    name: string;
                    type: {
                        array: (string | number)[];
                    };
                })[];
            };
        } | {
            name: string;
            type: {
                kind: string;
                fields: ({
                    name: string;
                    type: string;
                } | {
                    name: string;
                    type: {
                        option: string;
                    };
                })[];
            };
        })[];
        constants: {
            name: string;
            type: string;
            value: string;
        }[];
    };
    idlType: PaymentProcessor;
    create(provider: anchor.Provider, program: Program<PaymentProcessor>): {
        getGlobalConfigPda: () => [PublicKey, number];
        getPaymentTypePda: (paymentType: string) => [PublicKey, number];
        initialize: (newAdmin: PublicKey) => Promise<{
            signature: string;
            globalConfigPda: PublicKey;
        }>;
        setPaymentType: (args: {
            paymentTypeName: string;
            amount: anchor.BN;
            token: PublicKey;
        }) => Promise<{
            signature: string;
            paymentTypePda: PublicKey;
        }>;
        pay: (args: {
            paymentTypeName: string;
            amount: anchor.BN | number;
            agentWallet: PublicKey;
            paymentId: Uint8Array | number[] | Buffer;
            payerAta?: PublicKey;
            receiverToken?: PublicKey;
        }) => Promise<{
            signature: string;
        }>;
        getGlobalConfig: () => Promise<{
            globalConfigPda: PublicKey;
            globalConfig: any | null;
        }>;
        getPaymentType: (paymentTypeName: string) => Promise<{
            paymentTypePda: anchor.web3.PublicKey;
            paymentType: {
                name: string;
                amount: anchor.BN | null;
                token: anchor.web3.PublicKey;
            };
        } | {
            paymentTypePda: anchor.web3.PublicKey;
            paymentType: null;
        }>;
    };
};
export default _default;
export type { PaymentProcessor };
export declare const xyberPaymentProcessorSdk: {
    idlJson: {
        address: string;
        metadata: {
            name: string;
            version: string;
            spec: string;
            description: string;
        };
        instructions: ({
            name: string;
            docs: string[];
            discriminator: number[];
            accounts: ({
                name: string;
                writable: boolean;
                signer: boolean;
                pda?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                pda: {
                    seeds: {
                        kind: string;
                        value: number[];
                    }[];
                };
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                address: string;
                writable?: undefined;
                signer?: undefined;
                pda?: undefined;
            })[];
            args: {
                name: string;
                type: string;
            }[];
        } | {
            name: string;
            docs: string[];
            discriminator: number[];
            accounts: ({
                name: string;
                pda: {
                    seeds: ({
                        kind: string;
                        value: number[];
                        path?: undefined;
                    } | {
                        kind: string;
                        path: string;
                        value?: undefined;
                    })[];
                };
                writable?: undefined;
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                pda?: undefined;
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                pda?: undefined;
                writable?: undefined;
                signer?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                signer: boolean;
                pda?: undefined;
                address?: undefined;
            } | {
                name: string;
                address: string;
                pda?: undefined;
                writable?: undefined;
                signer?: undefined;
            })[];
            args: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    array: (string | number)[];
                };
            })[];
        } | {
            name: string;
            docs: string[];
            discriminator: number[];
            accounts: ({
                name: string;
                writable: boolean;
                pda: {
                    seeds: ({
                        kind: string;
                        value: number[];
                        path?: undefined;
                    } | {
                        kind: string;
                        path: string;
                        value?: undefined;
                    })[];
                };
                signer?: undefined;
                relations?: undefined;
                address?: undefined;
            } | {
                name: string;
                writable: boolean;
                signer: boolean;
                relations: string[];
                pda?: undefined;
                address?: undefined;
            } | {
                name: string;
                address: string;
                writable?: undefined;
                pda?: undefined;
                signer?: undefined;
                relations?: undefined;
            })[];
            args: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    option: string;
                };
            })[];
        })[];
        accounts: {
            name: string;
            discriminator: number[];
        }[];
        events: {
            name: string;
            discriminator: number[];
        }[];
        errors: {
            code: number;
            name: string;
            msg: string;
        }[];
        types: ({
            name: string;
            type: {
                kind: string;
                fields: ({
                    name: string;
                    type: string;
                } | {
                    name: string;
                    type: {
                        array: (string | number)[];
                    };
                })[];
            };
        } | {
            name: string;
            type: {
                kind: string;
                fields: ({
                    name: string;
                    type: string;
                } | {
                    name: string;
                    type: {
                        option: string;
                    };
                })[];
            };
        })[];
        constants: {
            name: string;
            type: string;
            value: string;
        }[];
    };
    idlType: PaymentProcessor;
    create: (provider: anchor.Provider, program: Program<PaymentProcessor>) => any;
};
