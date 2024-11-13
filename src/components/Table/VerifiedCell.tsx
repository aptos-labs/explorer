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
} from "@mui/icons-material";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import * as React from "react";
import {
  codeBlockColor,
  codeBlockColorClickableOnHover,
} from "../../themes/colors/aptosColorPalette";
import {BUTTON_HEIGHT} from "../TitleHashButton";

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
}

export function isBannedType(level: VerifiedType): boolean {
  return (
    level === VerifiedType.COMMUNITY_BANNED ||
    level === VerifiedType.LABS_BANNED
  );
}

const nativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0xa": "APT",
  "0xA": "APT",
};
const labsVerifiedTokens: Record<string, string> = {
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": "USDt",
  "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9":
    "Find Out Points",
  "0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89": "BUIDL",
};
const MARKED_AS_SCAM = "Marked as scam";
const MARKED_AS_POSSIBLE_SCAM = "Marked as possible scam";
const labsBannedTokens: Record<string, string> = {
  "0x397071c01929cc6672a17f130bd62b1bce224309029837ce4f18214cc83ce2a7::USDC::USDC":
    MARKED_AS_SCAM,
  "0x50788befc1107c0cc4473848a92e5c783c635866ce3c98de71d2eeb7d2a34f85::apt_rewards::APTRewards":
    MARKED_AS_SCAM,
  "0xbbc4a9af0e7fa8885bda5db08028e7b882f2c2bba1e0fedbad1d8316f73f8b2f::ograffio::Ograffio":
    MARKED_AS_SCAM,
  "0xf658475dc67a4d48295dbcea6de1dc3c9af64c1c80d4161284df369be941dafb::moon_coin::MoonCoin":
    MARKED_AS_SCAM,
  "0x48327a479bf5c5d2e36d5e9846362cff2d99e0e27ff92859fc247893fded3fbd::APTOS::APTOS":
    MARKED_AS_SCAM,
  "0xbc106d0fef7e5ce159423a1a9312e011bca7fb57f961146a2f88003a779b25c2::QUEST::QUEST":
    MARKED_AS_SCAM,
  "0xbe5e8fa9dd45e010cadba1992409a0fc488ca81f386d636ba38d12641ef91136::maincoin::Aptmeme":
    MARKED_AS_SCAM,
};
const labsBannedAddresses: Record<string, string> = {
  "0x50788befc1107c0cc4473848a92e5c783c635866ce3c98de71d2eeb7d2a34f85":
    MARKED_AS_SCAM,
  "0xbbc4a9af0e7fa8885bda5db08028e7b882f2c2bba1e0fedbad1d8316f73f8b2f":
    MARKED_AS_SCAM,
};

const labsBannedTokenSymbols: Record<string, string> = {
  APT: MARKED_AS_SCAM,
  USDT: MARKED_AS_POSSIBLE_SCAM,
  USDC: MARKED_AS_POSSIBLE_SCAM,
};

export type VerifiedLevelInfo = {
  level: VerifiedType;
  reason?: string;
};

export function verifiedLevel(input: VerifiedCellProps): VerifiedLevelInfo {
  if (nativeTokens[input.id]) {
    return {
      level: VerifiedType.NATIVE_TOKEN,
    };
  } else if (labsVerifiedTokens[input.id]) {
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
  } else if (input?.isInPanoraTokenList) {
    return {
      level: VerifiedType.COMMUNITY_VERIFIED,
    };
  } else if (input?.known) {
    return {
      level: VerifiedType.RECOGNIZED,
    };
  } else if (
    input.id.includes("::") &&
    labsBannedAddresses[input.id.split("::")[0]]
  ) {
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
  }
  return {tooltipMessage, icon};
}

export function VerifiedAsset({data}: {data: VerifiedCellProps}) {
  const theme = useTheme();
  const {level, reason} = verifiedLevel(data);
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

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={data.banner ? bannerTheme : undefined}
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
