import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import MultipleStopRoundedIcon from "@mui/icons-material/MultipleStopRounded";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import QuestionMarkOutlined from "@mui/icons-material/QuestionMarkOutlined";
import StartRoundedIcon from "@mui/icons-material/StartRounded";
import StopCircleOutlined from "@mui/icons-material/StopCircleOutlined";
import SubtitlesOutlinedIcon from "@mui/icons-material/SubtitlesOutlined";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import {Box, Stack, Typography, useTheme} from "@mui/material";
import {memo} from "react";
import {useTranslation} from "../i18n";
import TooltipTypography from "./TooltipTypography";

// Extracted static styles to avoid recreation on every render
const tableTransactionTypeStyle = {
  display: "flex",
  alignItems: "center",
} as const;
const tooltipTransactionTypeStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 2,
} as const;

export enum TransactionTypeName {
  BlockMetadata = "block_metadata_transaction",
  Genesis = "genesis_transaction",
  User = "user_transaction",
  Pending = "pending_transaction",
  StateCheckpoint = "state_checkpoint_transaction",
  Validator = "validator_transaction",
  BlockEpilogue = "block_epilogue_transaction",
  Unknown = "unknown",
}

type Color = "inherit" | "primary" | undefined;

function getTypeLabelKey(type: string): string {
  switch (type) {
    case TransactionTypeName.BlockMetadata:
      return "txn.type.blockMetadata";
    case TransactionTypeName.Genesis:
      return "txn.type.genesis";
    case TransactionTypeName.User:
      return "txn.type.user";
    case TransactionTypeName.Pending:
      return "txn.type.pending";
    case TransactionTypeName.StateCheckpoint:
      return "txn.type.stateCheckpoint";
    case TransactionTypeName.Validator:
      return "txn.type.validator";
    case TransactionTypeName.BlockEpilogue:
      return "txn.type.blockEpilogue";
    default:
      return "txn.type.unknown";
  }
}

function getTypeTooltipKey(type: string): string {
  switch (type) {
    case TransactionTypeName.BlockMetadata:
      return "txn.typeTooltip.blockMetadata";
    case TransactionTypeName.Genesis:
      return "txn.typeTooltip.genesis";
    case TransactionTypeName.User:
      return "txn.typeTooltip.user";
    case TransactionTypeName.Pending:
      return "txn.typeTooltip.pending";
    case TransactionTypeName.StateCheckpoint:
      return "txn.typeTooltip.stateCheckpoint";
    case TransactionTypeName.Validator:
      return "txn.typeTooltip.validator";
    case TransactionTypeName.BlockEpilogue:
      return "txn.typeTooltip.blockEpilogue";
    default:
      return "txn.typeTooltip.unknown";
  }
}

function getTypeIcon(type: string, color?: Color) {
  switch (type) {
    case TransactionTypeName.BlockMetadata:
      return <SubtitlesOutlinedIcon fontSize="small" color={color} />;
    case TransactionTypeName.Genesis:
      return <StartRoundedIcon fontSize="small" color={color} />;
    case TransactionTypeName.User:
      return <MultipleStopRoundedIcon fontSize="small" color={color} />;
    case TransactionTypeName.Pending:
      return <UpdateRoundedIcon fontSize="small" color={color} />;
    case TransactionTypeName.StateCheckpoint:
      return <OutlinedFlagIcon fontSize="small" color={color} />;
    case TransactionTypeName.Validator:
      return <CheckCircleOutlined fontSize="small" color={color} />;
    case TransactionTypeName.BlockEpilogue:
      return <StopCircleOutlined fontSize="small" color={color} />;
    default:
      return <QuestionMarkOutlined fontSize="small" color={color} />;
  }
}

type TransactionTypeProps = {
  type: string;
};

export function TransactionType({type}: TransactionTypeProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        color: theme.palette.text.secondary,
      }}
    >
      {getTypeIcon(type, "inherit")}
      <Typography variant="body2">
        {t(getTypeLabelKey(type), {type})}
      </Typography>
    </Box>
  );
}

// Memoized since rendered many times in transaction tables
export const TableTransactionType = memo(function TableTransactionType({
  type,
}: TransactionTypeProps) {
  return (
    <Box sx={tableTransactionTypeStyle}>{getTypeIcon(type, "inherit")}</Box>
  );
});

export const TooltipTransactionType = memo(function TooltipTransactionType({
  type,
}: TransactionTypeProps) {
  const {t} = useTranslation();
  return (
    <Box sx={tooltipTransactionTypeStyle}>
      {getTypeIcon(type, "inherit")}
      <Stack spacing={0.5}>
        <TooltipTypography variant="subtitle2" sx={{fontWeight: 600}}>
          {t(getTypeLabelKey(type), {type})}
        </TooltipTypography>
        <TooltipTypography variant="body2">
          {t(getTypeTooltipKey(type), {type})}
        </TooltipTypography>
      </Stack>
    </Box>
  );
});
