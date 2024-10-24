import {useQuery} from "@tanstack/react-query";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  standardizeAddress,
} from "../../utils";
import {ResponseError} from "../client";

const TTL = 60000; // 1 minute

// This is an override of ANS names, in case we want to display a verified name for an address
// TODO: this probably belongs somewhere else... but, for now, it's here
// https://github.com/aptscan-ai/labels/blob/3187ad6b0710261e37324bbc336f74e9a07334a0/labels.json#L216
// https://github.com/apscan/explorer/blob/master/src/config/address-tags.ts
const knownAddresses: Record<string, string> = {
  "0xa": "AptosCoin",
  "0x000000000000000000000000000000000000000000000000000000000000000a": "AptosCoin",
  // Aptos labs
  "0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c": "Aptos Name Service",
  "0x915efe6647e0440f927d46e39bcb5eb040a7e567e1756e002073bc6e26f2cd23": "Aptos yr1: Graffio",
  "0x96c192a4e3c529f0f6b3567f1281676012ce65ba4bb0a9b20b46dec4e371cccd": "Aptos yr2: NFT",
  // bridge
  "0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625": "Wormhole Bridge",
  "0x576410486a2da45eee6c949c995670112ddf2fbeedab20350d506328eefc9d4f": "Wormhole Token Bridge",
  "0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90": "LayerZero Bridge",
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa": "LayerZero Tokens",
  // DEX
  "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa": "PancakeSwap",
  "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af": "ThalaSwap",
  "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12": "LiquidSwap v0",
  "0x0163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e": "LiquidSwap v05",
  "0x54cb0bb2c18564b86e34539b9f89cfe1186e39d89fce54e1cd007b8e61673a85": "LiquidSwap v1",
  "0x80273859084bc47f92a6c2d3e9257ebb2349668a1b0fb3db1d759a04c7628855": "LiquidSwap multirouter",
  "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c": "SushiSwap",
  "0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b": "AptoSwap",
  "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541": "AuxExchange",  // dead
  "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1": "Cellana Finance",
  "0x1c3206329806286fd2223647c9f9b130e66baeb6d7224a18c1f642ffe48f3b4c": "Panora Exchange",
  "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c": "Econia Labs",
  // Lending
  "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3": "Aries Markets",
  "0x3c1d4a86594d681ff7e5d5a233965daeabdc6a15fe5672ceeda5260038857183": "Aptin Finance",
  "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba": "Echelon Market",
  // Liquid staking
  "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a": "Amnis Finance",
  // Defi (other)
  "0x17f1e926a81639e9557f4e4934df93452945ec30bc962e11351db59eb0d78c33": "VibrantX",
  "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06": "Merkle Trade",
  "0x890812a6bbe27dd59188ade3bbdbe40a544e6e104319b7ebc6617d3eb947ac07": "Hippo Aggregator",
  // NFT marketplace
  "0x584b50b999c78ade62f8359c91b5165ff390338d45f8e55969a04e65d76258c9": "Wapal NFT market",
  "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2": "Topaz NFT market",
  "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e": "Bluemove NFT market",
  "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4": "Souffl3 NFT market",
  "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26": "Mercato NFT market",
  // CEX
  "0xd91c64b777e51395c6ea9dec562ed79a4afa0cd6dad5a87b187c37198a1f855a": "Binance 1",
  "0x80174e0fe8cb2d32b038c6c888dd95c3e1560736f0d4a6e8bed6ae43b5c91f6f": "Binance 2",
  "0xae1a6f3d3daccaf77b55044cea133379934bba04a11b9d0bbd643eae5e6e9c70": "Binance 3",
  "0x834d639b10d20dcb894728aa4b9b572b2ea2d97073b10eacb111f338b20ea5d7": "OKX 1",
  "0x84b1675891d370d5de8f169031f9c3116d7add256ecf50a4bc71e3135ddba6e0": "Bybit 1",
  // Social
  "0x8d2d7bcde13b2513617df3f98cdd5d0e4b9f714c6308b9204fe18ad900d92609": "Chingari",
  // Games
  "0x6d138096fb880d1c16b48f10686b98a96000c0ac18501425378f784c6b81c34d": "Eragon",
  "0x66cb05df2d855fbae92cdb2dfac9a0b29c969a03998fa817735d27391b52b189": "ReadyGames",
  "0x08afb046f44dd0cb9c445458f9c2e424759cd11f4a270fe6739dcffc16a4db8e": "Slime revolution",
  // Other
  "0x5a0ad9e31a2f452504429b6f7073cb325994c2c66204f5deb8e0561a9e950c3c": "Tevi",
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

      // Change cache key specifically to invalidate all previous cached keys
      const cachedName = getLocalStorageWithExpiry(`${address}:name`);
      if (cachedName) {
        return cachedName;
      }
      // Ensure there's always .apt at the end
      const ansName = genANSName(
        address,
        shouldCache,
        state.network_name,
        isValidator,
      ).then((name) => (name ? `${name}.apt` : null));

      // use ANS name if available, otherwise use knownName
      // ideally on account page, we show both
      if (ansName) {
        return ansName;
      } else if (knownAddresses[standardizedAddress]) {
        return knownAddresses[standardizedAddress]; 
      } else {
        return null;
      }
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
