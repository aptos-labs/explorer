import GeneralTableCell from "./GeneralTableCell";
import {Stack} from "@mui/material";
import StyledTooltip from "../StyledTooltip";
import {
  DangerousOutlined,
  VerifiedUserOutlined,
  WarningAmberOutlined,
  WarningOutlined,
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
  BANNED, // Banned by Panora (or us)
  UNKNOWN, // Not in panora list, could be anything
}

const nativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0xa": "APT",
  "0xA": "APT",
};
const labsVerifiedTokens: Record<string, boolean> = {};

function verifiedLevel(input: VerifiedCellProps): VerifiedType {
  if (nativeTokens[input.id]) {
    return VerifiedType.NATIVE_TOKEN;
  } else if (labsVerifiedTokens[input.id]) {
    return VerifiedType.LABS_VERIFIED;
  } else if (input?.isBanned) {
    return VerifiedType.BANNED;
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
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
      }}
    >
      {level === VerifiedType.NATIVE_TOKEN ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is verified as a native token of Aptos.">
            <VerifiedUserOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : level === VerifiedType.COMMUNITY_VERIFIED ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is verified by the community on the Panora token list.">
            <VerifiedOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : level === VerifiedType.BANNED ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset has been banned on the Panora token list, please use with caution.">
            <DangerousOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : level === VerifiedType.UNVERIFIED ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is recognized, but not been verified by the community.">
            <WarningAmberOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is not verified, it may or may not be recognized by the community.">
            <WarningOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      )}
    </GeneralTableCell>
  );
}
