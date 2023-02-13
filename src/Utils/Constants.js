var Constants = {
  bsc: {
    testnet: "https://data-seed-prebsc-1-s1.binance.org:8545",
    mainet: "https://bsc-dataseed1.binance.org:443",

    providerUrl: "wss://speedy-nodes-nyc.moralis.io/21683a476c69240b28d9fd36/bsc/testnet/ws",
    //
    addressSystem: "0xd737341482D8b011D78DF40e3D727c51Ca764977",
    privateKeyAdmin: '9effd691e91d22c9a4077181c0f2c981a4727f0a0400554033ef8e2b52b27812',

    addressORIT: "0xDfED1B366089cfcBB504b2A90D7a5A8204d0dF7b",
    addressSoulStone: "0x8e6B53F2e5f230402d1886F2B71Ecd3a73586760",

    addressOriMon: "0x2952c913b31b97a081fC3dAB5AF81c70C1a8038A",

    priceNFT: 3 * 1000000000,
    feeGenerateNFT: 0.0142548,
  },

  solana: {
    testnet: {
      MORALIS_SERVER: "https://nrd5jg1rhlyz.bigmoralis.com:2053/server",
      MORALIS_APPID: "7OtBJyALpogZZagwGCxvOkR7Y7LCyFQrxCE6Jq1X",
      MORALIS_MASTER_KEY: "1DXyhYOkq8Z4w2u1HSinHhAvgqvOgagOENQoXkpt",

      addressSystem: "AG295msxmZ9cjEsDs7ECbK4akG4jkD9pq25y6UCEH3VN",
      privateKeyAdmin:
        [118, 224, 147, 230, 147, 175, 94, 76, 223, 118, 253, 82, 124, 175, 106, 83, 196, 146, 55, 104, 158, 45, 59, 55, 37, 196, 16, 210, 123, 42, 90, 18, 137, 146, 46, 200, 22, 18, 47, 126, 212, 188, 187, 121, 16, 83, 112, 228, 224, 94, 192, 92, 103, 62, 8, 135, 162, 171, 233, 31, 239, 208, 236, 37],

      addressORIT: "468thUePpceNciVEWMTLB4hKdb4pxVLciwpEFVq57XkD",
      accountORIT: "D33XDHMQVgjovnyoBzysfkzSBNJrib1N5apopFNgCJLV",

      addressSoulStone: "BqJy2xUXJhD1nXBe29LwYkcaZWwcFrPDx4BRCEg1aBvp",
      accountSoulStone: "23Q9TFbTu2bFFxadeZnhSDmW2SYWoUdbMrH44wRM3UET",

      addressGuildToken: "47Uvxf5YtpeDHfbE4E1zXkhnY4xuaUtTZU6CgpLQedqg",
      accountGuildToken: "C6EARxe6ELQwcQaForZSYwotxr1qHy881ieYNth1vXAL",

      //
      addressMirror: "8X94HJMFwvJddQP6vPZmMcqyZh6L5rQtLmF56RzVwRhC",
      accountMirror: "B6rj4Qc1Spwf1ej6tyHvBXkB2sVURz7fb5hqT1KBJMcG",

      addressSAD: "AkDLwVZbh7dBzQsVSzLBWAEQG2L1NVJgqpTd9MpC9qPn",
      accountSAD: "2HVrMdkVvv92Qc9GuP2P9sZp13K9Qks7TC4535hDkF7N",
    },
    devnet: {
      MORALIS_SERVER: "https://nrd5jg1rhlyz.bigmoralis.com:2053/server",
      MORALIS_APPID: "7OtBJyALpogZZagwGCxvOkR7Y7LCyFQrxCE6Jq1X",
      MORALIS_MASTER_KEY: "1DXyhYOkq8Z4w2u1HSinHhAvgqvOgagOENQoXkpt",

      addressSystem: "AG295msxmZ9cjEsDs7ECbK4akG4jkD9pq25y6UCEH3VN",
      privateKeyAdmin:
        [118, 224, 147, 230, 147, 175, 94, 76, 223, 118, 253, 82, 124, 175, 106, 83, 196, 146, 55, 104, 158, 45, 59, 55, 37, 196, 16, 210, 123, 42, 90, 18, 137, 146, 46, 200, 22, 18, 47, 126, 212, 188, 187, 121, 16, 83, 112, 228, 224, 94, 192, 92, 103, 62, 8, 135, 162, 171, 233, 31, 239, 208, 236, 37],

      addressORIT: "468thUePpceNciVEWMTLB4hKdb4pxVLciwpEFVq57XkD",
      accountORIT: "D33XDHMQVgjovnyoBzysfkzSBNJrib1N5apopFNgCJLV",

      addressSoulStone: "BqJy2xUXJhD1nXBe29LwYkcaZWwcFrPDx4BRCEg1aBvp",
      accountSoulStone: "23Q9TFbTu2bFFxadeZnhSDmW2SYWoUdbMrH44wRM3UET",

      addressGuildToken: "47Uvxf5YtpeDHfbE4E1zXkhnY4xuaUtTZU6CgpLQedqg",
      accountGuildToken: "C6EARxe6ELQwcQaForZSYwotxr1qHy881ieYNth1vXAL",

      //
      addressMirror: "8X94HJMFwvJddQP6vPZmMcqyZh6L5rQtLmF56RzVwRhC",
      accountMirror: "B6rj4Qc1Spwf1ej6tyHvBXkB2sVURz7fb5hqT1KBJMcG",

      addressSAD: "AkDLwVZbh7dBzQsVSzLBWAEQG2L1NVJgqpTd9MpC9qPn",
      accountSAD: "2HVrMdkVvv92Qc9GuP2P9sZp13K9Qks7TC4535hDkF7N",
    },
    mainet: {
      MORALIS_SERVER: "https://cigxr6cmrvwb.usemoralis.com:2053/server",
      MORALIS_APPID: "xWtt0HHq5JIrNim6NECmuJBLbeGUeIAXodPDmsGK",
      MORALIS_MASTER_KEY: "IuJRPKDOTT5XpyiN9nOnAUHEjFQrT4vjPprPcSJo",

      addressSystem: "AG295msxmZ9cjEsDs7ECbK4akG4jkD9pq25y6UCEH3VN",
      privateKeyAdmin:
        [118, 224, 147, 230, 147, 175, 94, 76, 223, 118, 253, 82, 124, 175, 106, 83, 196, 146, 55, 104, 158, 45, 59, 55, 37, 196, 16, 210, 123, 42, 90, 18, 137, 146, 46, 200, 22, 18, 47, 126, 212, 188, 187, 121, 16, 83, 112, 228, 224, 94, 192, 92, 103, 62, 8, 135, 162, 171, 233, 31, 239, 208, 236, 37],

      addressORIT: "468thUePpceNciVEWMTLB4hKdb4pxVLciwpEFVq57XkD",
      accountORIT: "D33XDHMQVgjovnyoBzysfkzSBNJrib1N5apopFNgCJLV",

      addressSoulStone: "BqJy2xUXJhD1nXBe29LwYkcaZWwcFrPDx4BRCEg1aBvp",
      accountSoulStone: "23Q9TFbTu2bFFxadeZnhSDmW2SYWoUdbMrH44wRM3UET",

      addressGuildToken: "47Uvxf5YtpeDHfbE4E1zXkhnY4xuaUtTZU6CgpLQedqg",
      accountGuildToken: "C6EARxe6ELQwcQaForZSYwotxr1qHy881ieYNth1vXAL",

      //
      addressMirror: "8X94HJMFwvJddQP6vPZmMcqyZh6L5rQtLmF56RzVwRhC",
      accountMirror: "B6rj4Qc1Spwf1ej6tyHvBXkB2sVURz7fb5hqT1KBJMcG",

      addressSAD: "AkDLwVZbh7dBzQsVSzLBWAEQG2L1NVJgqpTd9MpC9qPn",
      accountSAD: "2HVrMdkVvv92Qc9GuP2P9sZp13K9Qks7TC4535hDkF7N",
    },
    //
    priceNFT: 3 * 1000000000,
    feeGenerateNFT: 0.0142548,
  },
  //Storage
  pinataKey: "094be2fa38c6fa2e8321",
  pinataSecret: "5cea4f047c62fe859f93f8c1fee8108db27f0050e3633e1c3c1baa2f4689f040",

  API_NFTStorage:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEVjRmQ1N2Q3QjQxMEYwOWFmRTY5OTYxNzkxODlDYTViM2QyNTk4ZEIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNjcxNzE5Nzg1NiwibmFtZSI6Ik9yaU1vbnN0ZXIifQ.GA-Z2lCG9Ic4ZmA8t2LiGhyr--wVdEfiYKWu0dBWJ2c",
  bucketW3: 'origamimonster',

  //

  PATH_DRAW: "./nft/",
  PATH_ORIMONSTER: "./assets/",
  PATH_DRAW_LOCAL: "./origami-game-OriDungeon/www/img/faces/",
  MORALIS_SERVER: "https://nrd5jg1rhlyz.bigmoralis.com:2053/server",
  MORALIS_APPID: "7OtBJyALpogZZagwGCxvOkR7Y7LCyFQrxCE6Jq1X",
  MORALIS_MASTER_KEY: "1DXyhYOkq8Z4w2u1HSinHhAvgqvOgagOENQoXkpt",
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  WIN: 'win',
  LOSE: 'lose',
  typeMG: true, //0 for mongodb, 1 for moralis
  eventRate: [0, 2, 5, 5, 2, 25, 10, 5, 2, 30],
  ItemSLG: [26, 1],
  ItemLG: [5],
  ItemSSR: [8, 11, 13, 15, 19, 20, 21, 22, 23, 24],
  ItemSR: [4, 7, 9, 10, 12, 14, 16, 17, 18],
  MAX_ACTOR: 3,
  MAX_EVENT: 10,
  EXP_PARAMS: [30, 40, 50, 60],
  EXP_CHALLENGE: 50,
  EXP_FINDMONSTER: 5,
  EXP_MASTER: 1000,
  GOlD_CHALLENGE: 500,
  GOlD_FINDMONSTER: 50,
  GOLD_MASTER: 10000,
  KEY_ENEMY: "enemy",
  KEY_MYORIGAMI: "myOrigami",
  KEY_BATTLER: "battler",
  KEY_BATTLER_TYPE: "battler_type",
  KEY_BATTLER_TYPE_CHALLENGE: "battler_type_challenge",
  KEY_BATTLER_TYPE_FINDMONSTER: "battler_type_findmonster",
  KEY_BATTLER_TYPE_PVP: "battler_type_pvp",
  KEY_BATTLER_TYPE_BET: "battler_type_bet",
  KEY_EVsAS: "EVsA",
  KEY_ACTORS: "Actors",
  KEY_ITEMS: "Items",
  KEY_GLOBAL: "Global",
  KEY_SKILL: "Skill",
  KEY_MAP: "Map",
  KEY_PARTIES: "Parties",
  KEY_USER_EVENT: "UserEvent",
  KEY_ACCOUNT: "Account",
  KEY_EVENT: "Event",
  KEY_ACHIEVEMENT: "Achievement",
  KEY_GIFTCODE: "GiftCode",
  KEY_BADGE: "Badge",
  KEY_REGION: "Region",
  1: {
    immunes: [],
    weaknesses: [4, 3, 7],
    strengths: [6, 5, 10],
  },
  2: {
    immunes: [],
    weaknesses: [4, 11, 1, 8],
    strengths: [3, 5, 7],
  },
  3: {
    immunes: [],
    weaknesses: [2, 5, 6, 7],
    strengths: [1, 4],
  },
  4: {
    immunes: [],
    weaknesses: [3, 5],
    strengths: [1, 2, 6, 9],
  },
  5: {
    immunes: [8],
    weaknesses: [1, 2],
    strengths: [3, 4, 11, 7, 6],
  },
  6: {
    immunes: [],
    weaknesses: [1, 3, 4],
    strengths: [2, 3, 8],
  },
  7: {
    immunes: [],
    weaknesses: [2, 5],
    strengths: [3, 8, 9],
  },
  8: {
    immunes: [],
    weaknesses: [1, 5, 7],
    strengths: [2, 8],
  },
  9: {
    immunes: [],
    weaknesses: [4, 7],
    strengths: [1, 2, 10],
  },
  10: {
    immunes: [],
    weaknesses: [1, 4, 11],
    strengths: [6, 9],
  },
  11: {
    immunes: [1],
    weaknesses: [5, 9],
    strengths: [2, 10],
  },
  reward: {
    max: 31,
    item1: 1,
    item2: 45,
    item3: 15,
    item4: 5,
    item5: 1,
    item6: 45,
    item7: 25,
    item8: 5,
    item9: 1,
    item10: 5,
    item11: 5,
    item12: 5,
    item13: 5,
    item14: 5,
    item15: 5,
    item16: 9,
    item17: 8,
    item18: 7,
    item19: 6,
    item20: 5,
    item21: 4,
    item22: 3,
    item23: 2,
    item24: 1,
    item25: 45,
    item26: 20,
    item27: 10,
    item28: 5,
    item29: 20,
    item30: 10,
    item31: 5,

    //Bookskill
    item100: 25,
    item101: 20,
    item102: 15,
    item103: 10,
    item104: 9,
    item105: 8,
    item106: 7,
    item107: 6,
    item108: 5,
    item109: 2,
    item110: 1,

    item111: 15,
    item112: 15,
    item113: 15,
    item114: 15,
    item115: 15,
    item116: 15,
    item117: 15,
    item118: 15,
    item119: 15,
    item120: 15,
    item121: 15,

    item122: 10,
    item123: 10,
    item124: 10,
    item125: 10,
    item126: 10,
    item127: 10,
    item128: 10,
    item129: 10,
    item130: 10,
    item131: 10,
    item132: 10,

    item133: 8,
    item134: 8,
    item135: 8,
    item136: 8,
    item137: 8,
    item138: 8,
    item139: 8,
    item140: 8,
    item141: 8,
    item142: 8,
    item143: 8,

    item144: 7,
    item145: 7,
    item146: 7,
    item147: 7,
    item148: 7,
    item149: 7,
    item150: 7,
    item151: 7,
    item152: 7,
    item153: 7,
    item154: 7,

    item155: 6,
    item156: 6,
    item157: 6,
    item158: 6,
    item159: 6,
    item160: 6,
    item161: 6,
    item162: 6,
    item163: 6,
    item164: 6,
    item165: 6,

    item166: 5,
    item167: 5,
    item168: 5,
    item169: 5,
    item170: 5,
    item171: 5,
    item172: 5,
    item173: 5,
    item174: 5,
    item175: 5,
    item176: 5,

    item177: 4,
    item178: 4,
    item179: 4,
    item180: 4,
    item181: 4,
    item182: 4,
    item183: 4,
    item184: 4,
    item185: 4,
    item186: 4,
    item187: 4,

    item188: 3,
    item189: 3,
    item190: 3,
    item191: 3,
    item192: 3,
    item193: 3,
    item194: 3,
    item195: 3,
    item196: 3,
    item197: 3,
    item198: 3,

    item199: 2,
    item200: 2,
    item201: 2,
    item202: 2,
    item203: 2,
    item204: 2,
    item205: 2,
    item206: 2,
    item207: 2,
    item208: 2,
    item209: 2,

    item210: 1,
    item211: 1,
    item212: 1,
    item213: 1,
    item214: 1,
    item215: 1,
    item216: 1,
    item217: 1,
    item218: 1,
    item219: 1,
    item220: 1,

    //Buff Skill
    item221: 10,
    item222: 10,
    item223: 10,
    item224: 10,
    item225: 10,
    item226: 10,

    //Debuff Skill
    item227: 10,
    item228: 10,
    item229: 10,
    item230: 10,
    item231: 10,
    item232: 10,

    //Effect 
    item233: 10, //Heal
    item234: 10, //Sleep
    item235: 10, //Blind
    item236: 10, //Silence
    item237: 10, //Rage
    item238: 10, //Confusion
    item239: 10, //Burn
    item240: 10, //Heal
    item241: 10, //Heal

  },
};
module.exports = Constants;
