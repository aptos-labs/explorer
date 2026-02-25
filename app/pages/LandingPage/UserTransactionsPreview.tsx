import {Stack, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type {Types} from "~/types/aptos";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import useGetUserTransactionVersions from "../../api/hooks/useGetUserTransactionVersions";
import {Link} from "../../routing";
import {UserTransactionsTable} from "../Transactions/TransactionsTable";
import {ensureMillisecondTimestamp} from "../utils";
import TransactionsPreview from "./TransactionsPreview";

const PREVIEW_TRANSACTIONS_COUNT = 10;

export default function UserTransactionsPreview() {
  const versions = useGetUserTransactionVersions(PREVIEW_TRANSACTIONS_COUNT);
  const latestVersion = useGetTransaction(
    versions[0] ? versions[0].toString() : "1",
  );
  // When there's no data, show the normal preview component
  if (!latestVersion?.data || versions.length === 0)
    return <TransactionsPreview />;

  // When there is data, show the user transactions table, if it's up to date, otherwise fallback to the preview component
  if (latestVersion.isLoading || latestVersion.isError) {
    return <TransactionsPreview />;
  }

  const latestTransaction =
    latestVersion.data as Types.Transaction_UserTransaction;
  const timeBehind =
    BigInt(Date.now().valueOf()) -
    ensureMillisecondTimestamp(latestTransaction.timestamp);
  if (timeBehind > 1000n * 60n * 5n) {
    // If the latest transaction is more than 5 minutes old, show all transactions
    return <TransactionsPreview />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">User Transactions</Typography>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} />
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <Button
          component={Link}
          to="/transactions"
          variant="primary"
          sx={{margin: "0 auto", mt: 3}}
        >
          View all Transactions
        </Button>
      </Box>
    </Stack>
  );
}
