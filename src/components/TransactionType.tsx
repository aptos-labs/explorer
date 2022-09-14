import {Box, Typography} from "@mui/material";
import React from "react";
import StartRoundedIcon from "@mui/icons-material/StartRounded";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import SubtitlesOutlinedIcon from "@mui/icons-material/SubtitlesOutlined";
import MultipleStopRoundedIcon from "@mui/icons-material/MultipleStopRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import {grey} from "../themes/colors/aptosColorPalette";

function getTypeLabel(type: string): string {
  switch (type) {
    case "block_metadata_transaction":
      return "Block Metadata";
    case "genesis_transaction":
      return "Genesis Transaction";
    case "user_transaction":
      return "User Transaction";
    case "pending_transaction":
      return "Pending Transaction";
    case "state_checkpoint_transaction":
      return "State Checkpoint";
    default:
      throw `Unknown TransactionType:${type}`;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "block_metadata_transaction":
      return <SubtitlesOutlinedIcon fontSize="small" />;
    case "genesis_transaction":
      return <StartRoundedIcon fontSize="small" />;
    case "user_transaction":
      return <MultipleStopRoundedIcon fontSize="small" />;
    case "pending_transaction":
      return <UpdateRoundedIcon fontSize="small" />;
    case "state_checkpoint_transaction":
      return <OutlinedFlagIcon fontSize="small" />;
    default:
      throw `Unknown TransactionType:${type}`;
  }
}

type TransactionTypeProps = {
  type: string;
};

export default function TransactionType({type}: TransactionTypeProps) {
  return (
    <Box
      sx={{display: "flex", alignItems: "center", gap: 1.5, color: grey[450]}}
    >
      {getTypeIcon(type)}
      <Typography variant="body2">{getTypeLabel(type)}</Typography>
    </Box>
  );
}
