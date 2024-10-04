import * as React from "react";
import {Stack} from "@mui/material";
import {
  TooltipTransactionType,
  TransactionTypeName,
} from "../../../components/TransactionType";
import TableTooltip from "../../../components/Table/TableTooltip";

export default function TransactionTypeTooltip() {
  // TODO: Re-evaluate what belongs in this one
  return (
    <TableTooltip title="Transaction Types">
      <Stack spacing={2}>
        <TooltipTransactionType type={TransactionTypeName.User} />
        <TooltipTransactionType type={TransactionTypeName.BlockMetadata} />
        <TooltipTransactionType type={TransactionTypeName.StateCheckpoint} />
      </Stack>
    </TableTooltip>
  );
}
