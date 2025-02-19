import GeneralTableCell from "./GeneralTableCell";
import {Box, Stack, useTheme} from "@mui/material";
import StyledTooltip from "../StyledTooltip";
import {
  Dangerous,
  DangerousOutlined,
  Verified,
  VerifiedUser,
  Warning,
  WarningAmberOutlined,
  UnpublishedOutlined,
} from "@mui/icons-material";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import * as React from "react";
import {
  codeBlockColor,
  codeBlockColorClickableOnHover,
} from "../../themes/colors/aptosColorPalette";
import {BUTTON_HEIGHT} from "../TitleHashButton";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  AccountAddress,
  AccountAddressInput,
  DeriveScheme,
  Hex,
  HexInput,
  Network,
} from "@aptos-labs/ts-sdk";
import {sha3_256} from "js-sha3";
import {useGetFaPairedCoin} from "../../api/hooks/useGetFaPairedCoin";
import {useGetCoinList} from "../../api/hooks/useGetCoinList";
import {
  EMOJICOIN_REGISTRY_ADDRESS,
  labsBannedAddresses,
  labsBannedTokens,
  labsBannedTokenSymbols,
  manuallyVerifiedTokens,
  nativeTokens,
} from "../../constants";

type VerifiedCellProps = {
  id: string; // FA address or Coin Type
  known: boolean;
  isBanned?: boolean;
  isInPanoraTokenList?: boolean;
  banner?: boolean;
  symbol?: string;
};

export enum VerifiedType {
  NATIVE_TOKEN = "Native", // Native token e.g. APT
  LABS_VERIFIED = "Verified", // Specifically verified by labs
  COMMUNITY_VERIFIED = "Community Verified", // Verified by Panora
  RECOGNIZED = "Recognized", // In panora list but not verified
  UNVERIFIED = "Unverified", // Not in panora list, could be anything
  LABS_BANNED = "Banned", // Banned by labs
  COMMUNITY_BANNED = "Community Banned", // Banned by Panora
  DISABLED = "No Verification",
}

export function isBannedType(level: VerifiedType): boolean {
  return (
    level === VerifiedType.COMMUNITY_BANNED ||
    level === VerifiedType.LABS_BANNED
  );
}

export type VerifiedLevelInfo = {
  level: VerifiedType;
  reason?: string;
};

export function verifiedLevel(
  input: VerifiedCellProps,
  network: string,
): VerifiedLevelInfo {
  const isCoin = input.id.includes("::");

  let emojicoinInfo: {coin: string; lp: string} | null = null;
  if (isCoin && input.symbol) {
    emojicoinInfo = getEmojicoinMarketAddressAndTypeTags({
      symbol: input.symbol,
    });
  }

  if (nativeTokens[input.id]) {
    return {
      level: VerifiedType.NATIVE_TOKEN,
    };
  } else if (manuallyVerifiedTokens[input.id]) {
    return {
      level: VerifiedType.LABS_VERIFIED,
    };
  } else if (labsBannedTokens[input.id]) {
    return {
      level: VerifiedType.LABS_BANNED,
      reason: labsBannedTokens[input.id],
    };
  } else if (input?.isBanned) {
    return {
      level: VerifiedType.COMMUNITY_BANNED,
      // TODO: Add a reason?
    };
  } else if (network !== Network.MAINNET) {
    // Everything below here is for Mainnet only
    return {
      level: VerifiedType.DISABLED,
      reason: "Verification only enabled for Mainnet",
    };
  } else if (isCoin && emojicoinInfo?.lp === input.id) {
    // Emojicoins are deterministic and therefore automatically verified
    return {
      level: VerifiedType.LABS_VERIFIED,
      reason: "Verified as an Emojicoin LP",
    };
  } else if (isCoin && emojicoinInfo?.coin === input.id) {
    // Emojicoins are deterministic and therefore automatically verified
    return {
      level: VerifiedType.LABS_VERIFIED,
      reason: "Verified as an Emojicoin",
    };
  } else if (isCoin && labsBannedAddresses[input.id.split("::")[0]]) {
    return {
      level: VerifiedType.LABS_BANNED,
      reason: labsBannedAddresses[input.id.split("::")[0]],
    };
  } else if (
    input.symbol &&
    labsBannedTokenSymbols[input.symbol.toUpperCase() ?? ""]
  ) {
    return {
      level: VerifiedType.LABS_BANNED,
      reason: labsBannedTokenSymbols[input.symbol.toUpperCase() ?? ""],
    };
  } else if (input?.isInPanoraTokenList) {
    return {
      level: VerifiedType.COMMUNITY_VERIFIED,
    };
  } else if (input?.known) {
    return {
      level: VerifiedType.RECOGNIZED,
    };
  }

  return {
    level: VerifiedType.UNVERIFIED,
  };
}

export function getVerifiedMessageAndIcon(
  level: VerifiedType,
  reason?: string,
) {
  let tooltipMessage = "";
  let icon = null;
  switch (level) {
    case VerifiedType.NATIVE_TOKEN:
      tooltipMessage = `This asset is verified as a native token of Aptos.`;
      icon = <VerifiedUser fontSize="small" color="info" />;
      break;
    case VerifiedType.LABS_VERIFIED:
      tooltipMessage = `This asset is verified by the builders of the explorer.`;
      if (reason) {
        tooltipMessage += ` Reason: (${reason})`;
      }
      icon = <Verified fontSize="small" color="info" />;
      break;
    case VerifiedType.COMMUNITY_VERIFIED:
      tooltipMessage =
        "This asset is verified by the community on the Panora token list.";
      icon = <VerifiedOutlined fontSize="small" color="info" />;
      break;
    case VerifiedType.RECOGNIZED:
      tooltipMessage =
        "This asset is recognized, but many not have been verified by the community.";
      icon = <Warning fontSize="small" color="secondary" />;
      break;
    case VerifiedType.UNVERIFIED:
      tooltipMessage =
        "This asset is not verified, it may or may not be recognized by the community.  Please use with caution.";
      icon = <WarningAmberOutlined fontSize="small" color="warning" />;
      break;
    case VerifiedType.COMMUNITY_BANNED:
      tooltipMessage =
        "This asset has been banned on the Panora token list, please avoid using this asset.";
      icon = <DangerousOutlined fontSize="small" color="error" />;
      break;
    case VerifiedType.LABS_BANNED:
      tooltipMessage = `This asset has been marked as a scam or dangerous, please avoid using this asset.`;
      if (reason) {
        tooltipMessage += ` Reason: (${reason})`;
      }
      icon = <Dangerous fontSize="small" color="error" />;
      break;
    case VerifiedType.DISABLED:
      tooltipMessage = `Verification disabled for non-Mainnet`;
      if (reason) {
        tooltipMessage += ` Reason: (${reason})`;
      }
      icon = <UnpublishedOutlined fontSize="small" color="disabled" />;
  }
  return {tooltipMessage, icon};
}

export function VerifiedAsset({data}: {data: VerifiedCellProps}) {
  const theme = useTheme();
  const [state] = useGlobalState();

  const isCoin = data.id.includes("::");

  const {isLoading, data: pairedCoin} = useGetFaPairedCoin(data.id);
  const {data: coinList} = useGetCoinList();

  let {level, reason}: VerifiedLevelInfo = {
    level: VerifiedType.UNVERIFIED,
    reason: undefined,
  };
  if (!isCoin && pairedCoin && coinList) {
    const matchedCoin = coinList.data.find(
      (desc) => desc.tokenAddress === pairedCoin,
    );
    if (matchedCoin) {
      const matchedCoinData = {
        id: pairedCoin,
        known: true,
        isBanned: matchedCoin.isBanned,
        symbol: matchedCoin.symbol,
        isInPanoraTokenList: matchedCoin.isInPanoraTokenList,
      };
      const result = verifiedLevel(matchedCoinData, state.network_name);
      level = result.level;
      reason = result.reason;
    } else {
      const result = verifiedLevel(
        {
          id: pairedCoin,
          known: data.known,
          symbol: data.symbol,
          isInPanoraTokenList: data.isInPanoraTokenList,
        },
        state.network_name,
      );
      level = result.level;
      reason = result.reason;
    }
  } else {
    const result = verifiedLevel(data, state.network_name);
    level = result.level;
    reason = result.reason;
  }
  const {tooltipMessage, icon} = getVerifiedMessageAndIcon(level, reason);

  const bannerTheme = {
    height: BUTTON_HEIGHT,
    backgroundColor: codeBlockColor,
    "&:hover": {
      backgroundColor: codeBlockColorClickableOnHover,
    },
    color: theme.palette.mode === "dark" ? "#83CCED" : "#0EA5E9",
    padding: "0.15rem 0.35rem 0.15rem 0.5rem",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    borderRadius: 50,
    textDecoration: "none",
  };

  return isLoading ? (
    <Box>Loading...</Box>
  ) : (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        ...(data.banner ? bannerTheme : {}),
        padding: 1,
      }}
    >
      <StyledTooltip title={tooltipMessage}>{icon}</StyledTooltip>
      {data.banner && <Box>{level}</Box>}
    </Stack>
  );
}

export function VerifiedCoinCell({data}: {data: VerifiedCellProps}) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
      }}
    >
      <VerifiedAsset data={data} />
    </GeneralTableCell>
  );
}

export const TEXT_ENCODER = new TextEncoder();

export function getEmojicoinMarketAddressAndTypeTags(args: {symbol: string}) {
  if (!args.symbol.match(/^\p{Emoji}+$/u)) {
    return null;
  }
  const symbolBytes = TEXT_ENCODER.encode(args.symbol);
  const marketAddress = deriveEmojicoinPublisherAddress({
    symbol: symbolBytes,
  });

  return {
    marketAddress,
    coin: `${marketAddress.toString()}::coin_factory::Emojicoin`,
    lp: `${marketAddress.toString()}::coin_factory::EmojicoinLP`,
  };
}

export function deriveEmojicoinPublisherAddress(args: {
  symbol: Uint8Array;
}): AccountAddress {
  return createNamedObjectAddress({
    creator: EMOJICOIN_REGISTRY_ADDRESS,
    seed: args.symbol,
  });
}

export function createNamedObjectAddress(args: {
  creator: AccountAddressInput;
  seed: HexInput;
}): AccountAddress {
  const creatorAddress = AccountAddress.from(args.creator);
  const seed = Hex.fromHexInput(args.seed).toUint8Array();
  const serializedCreatorAddress = creatorAddress.bcsToBytes();
  const preImage = new Uint8Array([
    ...serializedCreatorAddress,
    ...seed,
    DeriveScheme.DeriveObjectAddressFromSeed,
  ]);

  return AccountAddress.from(sha3_256(preImage));
}
