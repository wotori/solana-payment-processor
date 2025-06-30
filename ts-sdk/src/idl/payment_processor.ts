/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/payment_processor.json`.
 */
export type PaymentProcessor = {
  "address": "8D6DNFXjHFDG2Lgaw84uh111YxtYpJ3yaJJehRpbjt83",
  "metadata": {
    "name": "paymentProcessor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "One-time program initialization by the admin."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "pay",
      "docs": [
        "Pay for a prompt (or any other registered payment_type)."
      ],
      "discriminator": [
        119,
        18,
        216,
        65,
        192,
        117,
        122,
        220
      ],
      "accounts": [
        {
          "name": "globalConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "paymentType",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "paymentTypeName"
              }
            ]
          }
        },
        {
          "name": "payerAta",
          "writable": true
        },
        {
          "name": "agentWallet"
        },
        {
          "name": "agentAta",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "paymentType",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "paymentId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "setPaymentType",
      "docs": [
        "Register or update a payment_type that users can purchase."
      ],
      "discriminator": [
        51,
        107,
        40,
        148,
        222,
        186,
        109,
        72
      ],
      "accounts": [
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "paymentType",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "paymentTypeName"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "globalConfig"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "paymentTypeName",
          "type": "string"
        },
        {
          "name": "amount",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "token",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "paymentType",
      "discriminator": [
        153,
        159,
        151,
        126,
        70,
        102,
        97,
        97
      ]
    }
  ],
  "events": [
    {
      "name": "operationPaid",
      "discriminator": [
        247,
        218,
        172,
        190,
        170,
        18,
        145,
        99
      ]
    },
    {
      "name": "paymentTypeAdded",
      "discriminator": [
        209,
        41,
        213,
        125,
        145,
        66,
        39,
        225
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unsupportedMint",
      "msg": "Unsupported payment token mint"
    },
    {
      "code": 6001,
      "name": "wrongReceiver",
      "msg": "Receiver token authority does not match agent wallet"
    },
    {
      "code": 6002,
      "name": "priceMismatch",
      "msg": "Provided price does not match operation price"
    },
    {
      "code": 6003,
      "name": "unauthorized",
      "msg": "Caller is not authorized to modify the global config"
    }
  ],
  "types": [
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "operationPaid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "paymentMint",
            "type": "pubkey"
          },
          {
            "name": "paymentId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "agentWallet",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "paymentType",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "amount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "token",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "paymentTypeAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paymentType",
            "type": "string"
          },
          {
            "name": "price",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "token",
            "type": "pubkey"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "globalConfigSeed",
      "type": "bytes",
      "value": "[103, 108, 111, 98, 97, 108, 45, 99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "operationSeed",
      "type": "bytes",
      "value": "[111, 112, 101, 114, 97, 116, 105, 111, 110]"
    }
  ]
};
