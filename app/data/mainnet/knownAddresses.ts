/**
 * Known addresses for Mainnet
 * Maps addresses to human-readable names for display in the explorer
 */
export const mainnetKnownAddresses: Record<string, string> = {
  // Core Framework
  "0x0000000000000000000000000000000000000000000000000000000000000001":
    "Framework (0x1)",
  "0x0000000000000000000000000000000000000000000000000000000000000003":
    "Legacy Token (0x3)",
  "0x0000000000000000000000000000000000000000000000000000000000000004":
    "Digital Assets (0x4)",
  "0x000000000000000000000000000000000000000000000000000000000000000A":
    "Aptos Coin Fungible Asset",
  "0xdcc43c54a666493b6cbfc1ecc81af0bc24e9b75c5ab3a7065c1fc9632ee8bd82":
    "GovScan Voting",

  // Aptos Labs
  "0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c":
    "Aptos Name Service",
  "0x915efe6647e0440f927d46e39bcb5eb040a7e567e1756e002073bc6e26f2cd23":
    "Aptos yr1: Graffio",
  "0x96c192a4e3c529f0f6b3567f1281676012ce65ba4bb0a9b20b46dec4e371cccd":
    "Aptos yr2: NFT",
  "0xee443c3b5ae14baaee87ea410a4badba1227dae386a616936aad88d053849638":
    "Aptos Hongbao",

  // Bridges
  "0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625":
    "Wormhole Bridge",
  "0x576410486a2da45eee6c949c995670112ddf2fbeedab20350d506328eefc9d4f":
    "Wormhole Token",
  "0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90":
    "LayerZero Bridge",
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa":
    "LayerZero Token",
  "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d":
    "Celer Bridge",

  // DEX
  "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa":
    "PancakeSwap",
  "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af":
    "ThalaSwap v1",
  "0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5":
    "ThalaSwap v2",
  "0x075b4890de3e312d9425408c43d9a9752b64ab3562a30e89a55bdc568c645920":
    "ThalaSwap CL",
  "0x6b3720cd988adeaf721ed9d4730da4324d52364871a68eac62b46d21e4d2fa99":
    "Thala Farm",
  "0xcb8365dc9f7ac6283169598aaad7db9c7b12f52da127007f37fa4565170ff59c":
    "ThalaSwap CL Farm",
  "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12":
    "LiquidSwap v0",
  "0x0163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e":
    "LiquidSwap v0.5",
  "0x54cb0bb2c18564b86e34539b9f89cfe1186e39d89fce54e1cd007b8e61673a85":
    "LiquidSwap v1",
  "0xb247ddeee87e848315caf9a33b8e4c71ac53db888cb88143d62d2370cca0ead2":
    "LiquidSwap v1 Farms",
  "0x80273859084bc47f92a6c2d3e9257ebb2349668a1b0fb3db1d759a04c7628855":
    "LiquidSwap router",
  "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c":
    "SushiSwap", // defunct
  "0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b":
    "AptoSwap", // defunct
  "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541":
    "AuxExchange", // defunct
  "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1":
    "Cellana Finance",
  "0xea098f1fa9245447c792d18c069433f5da2904358e1e340c55bdc68a8f5fe037":
    "Cellana Rewards",
  "0x1c3206329806286fd2223647c9f9b130e66baeb6d7224a18c1f642ffe48f3b4c":
    "Panora Exchange",
  "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d":
    "KanaLabs",
  "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c":
    "Econia Labs",
  "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c":
    "Hyperion",
  "0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a":
    "Tapp Exchange",
  "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba":
    "Cetus 1", // defunct
  "0xa7f01413d33ba919441888637ca1607ca0ddcbfa3c0a9ddea64743aaa560e498":
    "Cetus 2", // defunct
  "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b": "Obric", // defunct
  "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c":
    "AnimeSwap", // defunct

  // Lending
  "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3":
    "Aries Markets",
  "0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896":
    "Aptin Finance v1",
  "0x3c1d4a86594d681ff7e5d5a233965daeabdc6a15fe5672ceeda5260038857183":
    "Aptin Finance v2",
  "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba":
    "Echelon Market",
  "0x024c90c44edf46aa02c3e370725b918a59c52b5aa551388feb258bd5a1e82271":
    "Echelon Isolated Markets",
  "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed":
    "Echo Lending",
  "0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bbcb832a24768c4e175feec":
    "Echo Lending",
  "0x68476f9d437e3f32fd262ba898b5e3ee0a23a1d586a6cf29a28add35f253f6f7":
    "Meso Finance",
  "0xccd1a84ccea93531d7f165b90134aa0415feb30e8757ab1632dac68c0055f5c2":
    "Superposition",
  "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6":
    "Joule Finance",
  "0x3b90501eae5cdc53c507d53b4ddc5a37e620743ef0b53a6aa4f711118890d1e5":
    "Joule Bridge",
  "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01":
    "Thala CDP",

  // Yeap Finance
  "0x028b7f9f45e3c2846c67e52656e68eca2b5427e347cbb6b84babe2cbfb4dd671":
    "Yeap Deployer",
  "0xdf3728b33bf766ce6a2d2def9588c5e9311d574075f1b2fecfdceb672630f2df":
    "Yeap Deployment Proxy",
  "0x7135c5016dbb106cef86c8e86f8224950e293c955e47d85fad1dacebd499c86e":
    "Yeap Protocol Object",
  "0xd9ddbe1698749284ded9042095a4c86da4d4641034305bee1fed3b05276804eb":
    "Yeap Borrow API",
  "0xbf060526a668c930d9f4e7e53454eee04cd5605ebc52ffe7616b90e5d4fd1660":
    "Yeap Borrow Protocol Common",
  "0xdd21ef98d7aac0b5ed43ab1f1d7db1fdd6ab4b11ea47daba324fed32fec6c43b":
    "Yeap Earn API",
  "0xe91cbd739dec33cc4eba965a6794ea98b9b9739965a76d37d365bb08efba18f6":
    "Yeap Earn Protocol",
  "0x0580240d4d50a27acb8aa97f9d2ff187a4a0109557bf0a3c1eb016f429fec4fc":
    "Yeap Hyperion LLP Protocol",
  "0x2e260d06de0f8091434883aa9d5112b5e21a4c5a4c4bc8eaacaf923a99c2419b":
    "Yeap IRM",
  "0x038f7ab94ec470555cac53682ecf4521fdd50eff2e57bf9053d7bcb77842600f":
    "Yeap Oracle",
  "0xcbaf4a3b7db44a42a476c559b8dc2ddd3f831ca797356b37664252433040d7f8":
    "Yeap Oracle Lens",
  "0x9d5f60258ed3e10919f118140e3ba5b75a128d232928c8efbe63503223a5a6dc":
    "Yeap Oracle Manager",
  "0x4e72993902a071191274f42266a7da9daa3a2d68bc81d97229a9219099ed67c5":
    "Yeap SCMD Protocol",
  "0x109817339346eadc9c6c7d652ecbc615a80298fa387b32f93127024cf887dbd3":
    "Yeap Utils",
  "0x07b90b95e1060d9d2e424c6687ba03cccaed6996cccd4868b759c9fca361fa70":
    "Yeap Vault",

  // Aave (Mainnet)
  "0x34c3e6af238f3a7fa3f3b0088cbc4b194d21f62e65a15b79ae91364de5a81a3a":
    "Aave Acl",
  "0x531069f4741cdead39d70b76e5779863864654fae6db8a752a244ff2f9916c15":
    "Aave Config",
  "0x5eb5cc775c5a446db0f3a1c944e11563b97e6a7e1387b9fb459aa26168f738dc":
    "Aave Data",
  "0xc0338eea778de2a5348824ddbfcec033c7f7cbe18da6da40869562906b63c78c":
    "Aave Math",
  "0x12b05c42ac3209a3c6ffadff4ebb6c3e983e5115f26031d56652815b49a14245":
    "Aave Mock Underlyings",
  "0x249676f3faddb83d64fd101baa3f84a171ae02505d796e3edbf4861038a4b5cc":
    "Aave Oracle",
  "0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb":
    "Aave Pool",

  // Liquid Staking
  "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a":
    "Amnis Finance",
  "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6":
    "Thala LSD",
  "0x6f8ca77dd0a4c65362f475adb1c26ae921b1d75aa6b70e53d0e340efd7d8bc80":
    "TruFin",
  "0x2cc52445acc4c5e5817a0ac475976fbef966fedb6e30e7db792e10619c76181f": "Kofi",

  // DeFi (other)
  "0x17f1e926a81639e9557f4e4934df93452945ec30bc962e11351db59eb0d78c33":
    "VibrantX",
  "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06":
    "Merkle Trade",
  "0x890812a6bbe27dd59188ade3bbdbe40a544e6e104319b7ebc6617d3eb947ac07":
    "Hippo Aggregator",
  "0x60955b957956d79bc80b096d3e41bad525dd400d8ce957cdeb05719ed1e4fc26":
    "Thala router",
  "0x4e5e85fd647c7e19560590831616a3c021080265576af3182535a1d19e8bc2b3":
    "Uptos Pump",
  "0xcd7b88c2181881bf8e7ef741cae867aee038e75df94224496a4a81627edf7f65": "Defy",
  "0xa3111961a31597ca770c60be02fc9f72bdee663f563e45223e79793557eef0d9":
    "Lucid Finance",
  "0xddb92cba8f18ae94c40c49ca27a2ba31eca85ce37a436e25d36c8e1f516d9c62":
    "Pact Labs",
  "0xd47ead75b923422f7967257259e7a298f029da9e5484dc7aa1a9efbd4c3ae648":
    "Native FA Redemption",
  "0x0c727553dd5019c4887581f0a89dca9c8ea400116d70e9da7164897812c6646e":
    "Thetis Market",
  "0x22ac0df99460b1ec8e4ce7dc92cf1387697bde530c7c0397c7adbb7aa49f1682":
    "Propbase Nexus",
  "0x7a38039fffd016adcac2c53795ee49325e5ec6fddf3bf02651c09f9a583655a6":
    "Kana Perps",

  // NFT Marketplace
  "0x7ccf0e6e871977c354c331aa0fccdffb562d9fceb27e3d7f61f8e12e470358e9":
    "Wapal Aggregator",
  "0x584b50b999c78ade62f8359c91b5165ff390338d45f8e55969a04e65d76258c9":
    "Wapal Marketplace",
  "0x80d0084f99070c5cdb4b01b695f2a8b44017e41abf4a78c2487d3b52b5a4ae37":
    "Wapal Auction",
  "0xc777f5f82a2773d6e6f9c2e91306fc9c099a57747f64d86c59cf0acab706fd44":
    "Wapal Launchpad V2",
  "0x6547d9f1d481fdc21cd38c730c07974f2f61adb7063e76f9d9522ab91f090dac":
    "Wapal Launchpad",
  "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2":
    "Topaz Marketplace",
  "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e":
    "Bluemove Marketplace",
  "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4":
    "Souffl3 Marketplace",
  "0x465a0051e8535859d4794f0af24dbf35c5349bedadab26404b20b825035ee790":
    "Rarible Marketplace",
  "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26":
    "Tradeport",
  "0x86a32dcdd605152e58b984ac2538168214bb57ab4661c591a095563b3d2d6a37":
    "Tradeport Launchpad",
  "0x039e8ef8576a8eaf8ebcea5841cc7110bc7b5125aacd25086d510350a90a182e":
    "Rarible",
  "0x1e6009ce9d288f3d5031c06ca0b19a334214ead798a0cb38808485bd6d997a43":
    "OKX Marketplace",

  // CEX
  "0xd91c64b777e51395c6ea9dec562ed79a4afa0cd6dad5a87b187c37198a1f855a":
    "Binance 1",
  "0x80174e0fe8cb2d32b038c6c888dd95c3e1560736f0d4a6e8bed6ae43b5c91f6f":
    "Binance 2",
  "0xae1a6f3d3daccaf77b55044cea133379934bba04a11b9d0bbd643eae5e6e9c70":
    "Binance 3",
  "0x1d14ee0c332546658b13965a39faf5ec24ad195b722435d9fe23dc55487e67e3":
    "Binance 4",
  "0x33f91e694d40ca0a14cb84e1f27a4d03de5cf292b07ed75ed3286e4f243dab34":
    "Binance 5",
  "0x5bd7de5c56d5691f32ea86c973c73fec7b1445e59736c97158020018c080bb00":
    "Binance 6",
  "0xbdb53eb583ba02ab0606bdfc71b59a191400f75fb62f9df124494ab877cdfe2a":
    "Binance 7",
  "0xed8c46bec9dbc2b23c60568f822b95b87ea395f7e3fdb5e3adc0a30c55c0a60e":
    "Binance 8",
  "0x81701e60a8e783aecf4dd5e5c9eb76f70a4431bb7441309dc3c6099f2c9e63d5":
    "Binance.us 1",
  "0x0b3581f46ac8a6920fc9b87fecb7b459b9b39c177e65233826a7b4978bad41cd":
    "Coinbase 1",
  "0xa4e7455d27731ab857e9701b1e6ed72591132b909fe6e4fd99b66c1d6318d9e8":
    "Coinbase 2",
  "0x834d639b10d20dcb894728aa4b9b572b2ea2d97073b10eacb111f338b20ea5d7": "OKX 1",
  "0x8f347361a9461e9312a4d2b5b5b928c65c3a740965705361317e3ca0015c64d8": "OKX 2",
  "0x966e3ee07a3403a72f44c53f457d34c7148c2c8812c8d52509f54d4a00a36c41": "OKX 3",
  "0x51c6abe562e755582d268340b2cf0e2d8895a155dc9b7a7fb5465000d62d770b": "OKX 4",
  "0x3621fa917ffef3f0509f5d5953672a69791df329139644d89d0a1b0beb98c585": "OKX 5",
  "0x4c1ef44079cb31851349fba50d385f708a10ec7ac612859fdbf28888d1f7b572": "OKX 6",
  "0x84b1675891d370d5de8f169031f9c3116d7add256ecf50a4bc71e3135ddba6e0":
    "Bybit 1",
  "0xfd9192f8ad8dc60c483a884f0fbc8940f5b8618f3cf2bbf91693982b373dfdea":
    "Bitfinex 1",
  "0xdc7adffa09da5736ce1303f7441f4367fa423617c6822ad2fbc8522d9efd8fa4":
    "Kraken 1",
  "0x7ec963a7f9a4ee5d87e9431f5646162626c35774c799f4181d574f0ba938bf38":
    "Kraken Staking",
  "0x0cf869189c785beaaad2f5c636ced4805aeae9cbf49070dc93aed2f16b99012a":
    "Gate 1",
  "0xe8ca094fec460329aaccc2a644dc73c5e39f1a2ad6e97f82b6cbdc1a5949b9ea":
    "MEXC 1",
  "0xde084991b91637a08e4da2f1b398f5f935e1393b65d13cc99c597ec5dc105b6b":
    "Crypto.com 1",
  "0x0613f31af70ce983b9dca574e033a52351fd2e67b1959bf48574c6e9c956f95e":
    "Flipster",

  // Social
  "0x8d2d7bcde13b2513617df3f98cdd5d0e4b9f714c6308b9204fe18ad900d92609":
    "Chingari",
  "0xf6391863cca7d50afc4c998374645c8306e92988c93c6eb4b56972dd571f8467": "Kade",
  "0xf8d07848ad4937cb96ac14132ff8ce68223ab82cb7b3aa05bc6f78f7e2068a30":
    "Expo Passport",

  // Games
  "0x6d138096fb880d1c16b48f10686b98a96000c0ac18501425378f784c6b81c34d":
    "Eragon",
  "0x66cb05df2d855fbae92cdb2dfac9a0b29c969a03998fa817735d27391b52b189": "PL▶Y",
  "0x08afb046f44dd0cb9c445458f9c2e424759cd11f4a270fe6739dcffc16a4db8e":
    "Slime Revolution",
  "0x5a96fab415f43721a44c5a761ecfcccc3dae9c21f34313f0e594b49d8d4564f4": "KGeN",
  "0x2387f5f16330dbb0236b1776a0d86c7a4901daaa25cd61ecb33709e025d3172f": "KGeN",
  "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc": "KGeN",
  "0x09d518b9b84f327eafc5f6632200ea224a818a935ffd6be5d78ada250bbc44a6":
    "Supervillain Labs",
  "0x34ca84470e8d2907562f9a2f144c6c780282953b8b025ba220b0ecc5fc0aead9":
    "STAN app",
  "0xe63780c1d8f66aa2a5f30cc920af21fc82c4707225756c765bd12a2f7da61383":
    "Balance fun",
  "0x664f1da7f6256b26a7808e0e5b02e747c4c6450e92b602740a2a5514bba91e52":
    "Defi Cattos",

  // Fungible Assets
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": "USDt",
  "0xf73e887a8754f540ee6e1a93bdc6dde2af69fc7ca5de32013e89dd44244473cb":
    "USDt contract",
  "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b": "USDC",
  "0xe5c5befe31ce06bc1f2fd31210988aac08af6d821b039935557a6f14c03471be":
    "USDC contract",

  // Other
  "0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387": "Pyth", // oracle
  "0x07d7e436f0b2aafde60774efb26ccc432cf881b677aca7faaf2a01879bd19fb8":
    "Switchboard", // oracle
  "0xfea54925b5ac1912331e2e62049849b37842efaea298118b66f85a59057752b8":
    "Switchboard", // oracle
  "0xfb7ebc84ce674c3c1f7a789a30084d2227056982fb430dfd8b18c8f7737f4f57":
    "Chainlink", // oracle
  "0x9976bb288ed9177b542d568fa1ac386819dc99141630e582315804840f41928a":
    "Chainlink", // oracle
  "0x5a0ad9e31a2f452504429b6f7073cb325994c2c66204f5deb8e0561a9e950c3c": "Tevi",
  "0x541e28fb12aa661a30358f2bebcd44460187ec918cb9cee075c2db86ee6aed93":
    "Tevi (TVS)", // fungible store for TVS asset
  "0x39673a89d85549ad0d7bef3f53510fe70be2d5abaac0d079330ade5548319b62":
    "Only On Aptos NFT",
  "0x55f0ee4db1f09caf1bf49b2fb7298dba3a9da674108e26dc7adc78f8c94f298e":
    "Martian Wallet Fees",
  "0x407c4d644c0303f46f754b3ceaabf1e4af3f625a4936ae7e0f1c3e51082368ef":
    "Pontem Wallet Fees",
  "0xaa90e0d9d16b63ba4a289fb0dc8d1b454058b21c9b5c76864f825d5c1f32582e": "Msafe",
  "0xa5c6b23b141f610246348dd08111affcc2d2b1f5c8f8c768ca5c837d4f17fda2":
    "MSafe Wallet Fees",
  "0x4de5876d8a8e2be7af6af9f3ca94d9e4fafb24b5f4a5848078d8eb08f08e808a":
    "Securitize",
  "0xbabe32dbe1cb44c30363894da9f49957d6e2b94a06f2fc5c20a9d1b9e54cface":
    "Emojicoin.fun Rewards",
  "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61":
    "Emojicoin.fun Registry",
  "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe":
    "Emojicoin.fun",
  "0xde220d873e4f5eab5859f368b86fca00fa6fd395279cf54a7d7a5020cb527391":
    "Aptos Monkeys Echo",
  "0xd0995d57c9d4839dcecfdbb34a2650172a69fcfe0444f3229fec90eddf945141":
    "Petra Nudge",
  "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191":
    "AptID.xyz",
  "0xbbe8a08f3b9774fccb31e02def5a79f1b7270b2a1cb9ffdc05b2622813298f2a":
    "Hybrid Assets",
  "0x80f686c7bba12a0fce839ff160cb69774715497288996b861528727ccd256cdb":
    "UFC Strike",
  "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2":
    "WLFI USD",
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff":
    "Burn Address",
};

/**
 * Known scam addresses for Mainnet
 */
export const mainnetScamAddresses: Record<string, string> = {
  "0xde08428deaca3139a570fffb4231f3a72c6dff015bba93ee4e9bb6bc61fde0b6b":
    "Known Scam",
  "0x8c3d2d8b2fde2b55a6ce96ebd3c9bd655e3f90bc6cee8d6f3f78f7215d99e755":
    "Known Scam",
};
