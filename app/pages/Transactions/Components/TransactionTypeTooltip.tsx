import {Stack} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import {
  TooltipTransactionType,
  TransactionTypeName,
} from "../../../components/TransactionType";

export default function TransactionTypeTooltip() {
  // TODO: Re-evaluate what belongs in this one
  return (
    <TableTooltip title="Transaction Types">
      <Stack spacing={2}>
        {Object.values(TransactionTypeName).map((type) => (
          <TooltipTransactionType type={type} key={`ttt-${type}`} />
        ))}
      </Stack>
    </TableTooltip>
  );
}
