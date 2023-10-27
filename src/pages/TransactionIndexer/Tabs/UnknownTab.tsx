import {Alert, Stack, Box} from "@mui/material";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {Transactions} from "../../../gql/graphql";

type UnknownTabProps = {
  transaction: Transactions;
};

export default function UnknownTab({transaction}: UnknownTabProps) {
  return (
    <Box marginTop={3}>
      <Stack direction="column" spacing={3}>
        <Alert severity="error">{`Unknown transaction type: "${transaction.transaction_type}"`}</Alert>
        <JsonViewCard data={transaction} />
      </Stack>
    </Box>
  );
}
