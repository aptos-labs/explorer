import GeneralTableCell from "./GeneralTableCell";
import {Stack} from "@mui/material";
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

type VerifiedCellProps = {
  id: string; // FA address or Coin Type
  known: boolean;
  isBanned?: boolean;
  isInPanoraTokenList?: boolean;
};

export enum VerifiedType {
  NATIVE_TOKEN, // Native token e.g. APT
  LABS_VERIFIED, // Specifically verified by labs
  COMMUNITY_VERIFIED, // Verified by Panora
  UNVERIFIED, // In panora list but not verified
  COMMUNITY_BANNED, // Banned by Panora
  LABS_BANNED, // Banned by labs
  UNKNOWN, // Not in panora list, could be anything
}

const nativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0xa": "APT",
  "0xA": "APT",
};
const labsVerifiedTokens: Record<string, string> = {
  "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9":
    "Find Out Points",
};
const labsBannedTokens: Record<string, string> = {
  "0x397071c01929cc6672a17f130bd62b1bce224309029837ce4f18214cc83ce2a7::USDC::USDC":
    "scam",
  "0x50788befc1107c0cc4473848a92e5c783c635866ce3c98de71d2eeb7d2a34f85::apt_rewards::APTRewards":
    "scam",
  "0xbbc4a9af0e7fa8885bda5db08028e7b882f2c2bba1e0fedbad1d8316f73f8b2f::ograffio::Ograffio":
    "scam",
  "0xf658475dc67a4d48295dbcea6de1dc3c9af64c1c80d4161284df369be941dafb::moon_coin::MoonCoin":
    "scam",
  "0x48327a479bf5c5d2e36d5e9846362cff2d99e0e27ff92859fc247893fded3fbd::APTOS::APTOS":
    "scam",
};

function verifiedLevel(input: VerifiedCellProps): VerifiedType {
  if (nativeTokens[input.id]) {
    return VerifiedType.NATIVE_TOKEN;
  } else if (labsVerifiedTokens[input.id]) {
    return VerifiedType.LABS_VERIFIED;
  } else if (labsBannedTokens[input.id]) {
    return VerifiedType.LABS_BANNED;
  } else if (input?.isBanned) {
    return VerifiedType.COMMUNITY_BANNED;
  } else if (input?.isInPanoraTokenList) {
    return VerifiedType.COMMUNITY_VERIFIED;
  } else if (input?.known) {
    return VerifiedType.UNVERIFIED;
  } else {
    return VerifiedType.UNKNOWN;
  }
}

export function VerifiedCoinCell({data}: {data: VerifiedCellProps}) {
  const level = verifiedLevel(data);

  let tooltipMessage = "";
  let icon = null;
  switch (level) {
    case VerifiedType.NATIVE_TOKEN:
      tooltipMessage = "This asset is verified as a native token of Aptos.";
      icon = <VerifiedUser fontSize="small" />;
      break;
    case VerifiedType.LABS_VERIFIED:
      tooltipMessage = "This asset is verified.";
      icon = <Verified fontSize="small" />;
      break;
    case VerifiedType.COMMUNITY_VERIFIED:
      tooltipMessage =
        "This asset is verified by the community on the Panora token list.";
      icon = <VerifiedOutlined fontSize="small" />;
      break;
    case VerifiedType.UNVERIFIED:
      tooltipMessage =
        "This asset is recognized, but not been verified by the community.";
      icon = <Warning fontSize="small" />;
      break;
    case VerifiedType.UNKNOWN:
      tooltipMessage =
        "This asset is not verified, it may or may not be recognized by the community.";
      icon = <WarningAmberOutlined fontSize="small" />;
      break;
    case VerifiedType.COMMUNITY_BANNED:
      tooltipMessage =
        "This asset has been banned on the Panora token list, please use with caution.";
      icon = <DangerousOutlined fontSize="small" />;
      break;
    case VerifiedType.LABS_BANNED:
      tooltipMessage =
        "This asset has been marked as a scam or dangerous, please proceed with caution.";
      icon = <Dangerous fontSize="small" />;
      break;
  }

  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <StyledTooltip title={tooltipMessage}>{icon}</StyledTooltip>
      </Stack>
    </GeneralTableCell>
  );
}
