import * as React from "react";
import {Stack} from "@mui/material";
import {TooltipTransactionType} from "../../../components/TransactionType";
import TableTooltip from "../../../components/Table/TableTooltip";

export default function TransactionTypeTooltip() {
  return (
    <TableTooltip title="Transaction Types">
      <Stack spacing={2}>
        <TooltipTransactionType type="user_transaction" />
        <TooltipTransactionType type="block_metadata_transaction" />
        <TooltipTransactionType type="state_checkpoint_transaction" />
      </Stack>
    </TableTooltip>
  );
}
