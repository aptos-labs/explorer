import {Stack, Typography} from "@mui/material";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {Transactions} from "../../gql/graphql";

type TransactionTitleProps = {
  transaction: Transactions;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">Transaction</Typography>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.transaction_type} />
    </Stack>
  );
}
