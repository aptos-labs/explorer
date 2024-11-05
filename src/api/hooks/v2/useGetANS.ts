import {useQuery} from "@tanstack/react-query";
import {NetworkName} from "../../../constants";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  standardizeAddress,
} from "../../../utils";
import {ResponseError} from "../../client";

const TTL = 60000; // 1 minute

// This is an override of ANS names, in case we want to display a verified name for an address
// TODO: this probably belongs somewhere else... but, for now, it's here
// https://github.com/aptscan-ai/labels/blob/3187ad6b0710261e37324bbc336f74e9a07334a0/labels.json#L216
// https://github.com/apscan/explorer/blob/master/src/config/address-tags.ts
export const knownAddresses: Record<string, string> = {
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
  // Aptos labs
  "0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c":
    "Aptos Name Service",
  "0x915efe6647e0440f927d46e39bcb5eb040a7e567e1756e002073bc6e26f2cd23":
    "Aptos yr1: Graffio",
  "0x96c192a4e3c529f0f6b3567f1281676012ce65ba4bb0a9b20b46dec4e371cccd":
    "Aptos yr2: NFT",
  // bridge
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
  "0x7730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5":
    "ThalaSwap v2",
  "0x6b3720cd988adeaf721ed9d4730da4324d52364871a68eac62b46d21e4d2fa99":
    "Thala Farm",
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
    "SushiSwap",
  "0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b":
    "AptoSwap",
  "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541":
    "AuxExchange", // dead
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
  "0x68476f9d437e3f32fd262ba898b5e3ee0a23a1d586a6cf29a28add35f253f6f7":
    "Meso Finance",
  "0xccd1a84ccea93531d7f165b90134aa0415feb30e8757ab1632dac68c0055f5c2":
    "Superposition",
  "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6":
    "Joule Finance",
  "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01":
    "Thala CDP",
  // Liquid staking
  "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a":
    "Amnis Finance",
  "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6":
    "Thala LSD",
  "0x6f8ca77dd0a4c65362f475adb1c26ae921b1d75aa6b70e53d0e340efd7d8bc80":
    "TruFin",
  // Defi (other)
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
  // NFT marketplace
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
  "0x0b3581f46ac8a6920fc9b87fecb7b459b9b39c177e65233826a7b4978bad41cd":
    "Coinbase 1",
  "0xa4e7455d27731ab857e9701b1e6ed72591132b909fe6e4fd99b66c1d6318d9e8":
    "Coinbase 2",
  "0x834d639b10d20dcb894728aa4b9b572b2ea2d97073b10eacb111f338b20ea5d7": "OKX 1",
  "0x84b1675891d370d5de8f169031f9c3116d7add256ecf50a4bc71e3135ddba6e0":
    "Bybit 1",
  "0xfd9192f8ad8dc60c483a884f0fbc8940f5b8618f3cf2bbf91693982b373dfdea":
    "Bitfinex 1",
  "0xdc7adffa09da5736ce1303f7441f4367fa423617c6822ad2fbc8522d9efd8fa4": "Htx 1", // Huobi
  // Social
  "0x8d2d7bcde13b2513617df3f98cdd5d0e4b9f714c6308b9204fe18ad900d92609":
    "Chingari",
  "0xf6391863cca7d50afc4c998374645c8306e92988c93c6eb4b56972dd571f8467": "Kade",
  // Games
  "0x6d138096fb880d1c16b48f10686b98a96000c0ac18501425378f784c6b81c34d":
    "Eragon",
  "0x66cb05df2d855fbae92cdb2dfac9a0b29c969a03998fa817735d27391b52b189": "PL▶Y",
  "0x08afb046f44dd0cb9c445458f9c2e424759cd11f4a270fe6739dcffc16a4db8e":
    "Slime Revolution",
  "0x5a96fab415f43721a44c5a761ecfcccc3dae9c21f34313f0e594b49d8d4564f4": "KGeN",
  "0x09d518b9b84f327eafc5f6632200ea224a818a935ffd6be5d78ada250bbc44a6":
    "Supervillain Labs",
  "0x34ca84470e8d2907562f9a2f144c6c780282953b8b025ba220b0ecc5fc0aead9":
    "STAN app",
  // Fungible assets
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": "USDt",
  "0xf73e887a8754f540ee6e1a93bdc6dde2af69fc7ca5de32013e89dd44244473cb":
    "USDt contract",
  // Other
  "0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387": "Pyth", // oracle
  "0x07d7e436f0b2aafde60774efb26ccc432cf881b677aca7faaf2a01879bd19fb8":
    "Switchboard", // oracle
  "0x5a0ad9e31a2f452504429b6f7073cb325994c2c66204f5deb8e0561a9e950c3c": "Tevi",
  "0x541e28fb12aa661a30358f2bebcd44460187ec918cb9cee075c2db86ee6aed93":
    "Tevi (TVS)", // fungible store for TVS asset
  "0x39673a89d85549ad0d7bef3f53510fe70be2d5abaac0d079330ade5548319b62":
    "Only On Aptos NFT",
};

function getFetchNameUrl(
  network: NetworkName,
  address: string,
  isPrimary: boolean,
) {
  if (network !== "testnet" && network !== "mainnet") {
    return undefined;
  }

  return isPrimary
    ? `https://www.aptosnames.com/api/${network}/v1/primary-name/${address}`
    : `https://www.aptosnames.com/api/${network}/v1/name/${address}`;
}

export function useGetNameFromAddress(
  address: string,
  shouldCache = false,
  isValidator = false,
) {
  const [state] = useGlobalState();
  const queryResult = useQuery<string | null, ResponseError>({
    queryKey: ["ANSName", address, shouldCache, state.network_name],
    queryFn: () => {
      const standardizedAddress = standardizeAddress(address);
      const knownName = knownAddresses[standardizedAddress.toLowerCase()];
      if (knownName) {
        return knownName;
      }

      // Change cache key specifically to invalidate all previous cached keys
      const cachedName = getLocalStorageWithExpiry(`${address}:name`);
      if (cachedName) {
        return cachedName;
      }
      // Ensure there's always .apt at the end
      return genANSName(
        address,
        shouldCache,
        state.network_name,
        isValidator,
      ).then((name) => (name ? `${name}.apt` : null));
    },
  });

  return queryResult.data ?? undefined;
}

// this function will return null if ans name not found to prevent useQuery complaining about undefined return
// source for full context: https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4#undefined-is-an-illegal-cache-value-for-successful-queries
async function genANSName(
  address: string,
  shouldCache: boolean,
  networkName: NetworkName,
  isValidator: boolean,
): Promise<string | null> {
  const primaryNameUrl = getFetchNameUrl(networkName, address, true);

  if (!primaryNameUrl) {
    return null;
  }

  try {
    const {name: primaryName} = await fetchJsonResponse(primaryNameUrl);

    if (primaryName) {
      if (shouldCache) {
        setLocalStorageWithExpiry(address, primaryName, TTL);
      }
      return primaryName;
    } else if (isValidator) {
      return null;
    } else {
      const nameUrl = getFetchNameUrl(networkName, address, false);

      if (!nameUrl) {
        return null;
      }

      const {name} = await fetchJsonResponse(nameUrl);
      if (shouldCache) {
        setLocalStorageWithExpiry(address, name, TTL);
      }
      return name ?? null;
    }
  } catch (error) {
    console.error(
      `ERROR! Couldn't find ANS name for ${address} on ${networkName}`,
      error,
      typeof error,
    );
  }

  return null;
}
