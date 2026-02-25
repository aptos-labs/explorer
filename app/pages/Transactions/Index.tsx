import {Box, Button, Stack, Typography} from "@mui/material";
import {useEffect} from "react";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {useSearchParams} from "../../routing";
import PageHeader from "../layout/PageHeader";
import AllTransactions from "./AllTransactions";
import UserTransactions from "./UserTransactions";

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const allTxnOnly = searchParams.get("type") === "all";

  // Initial search params setup with replace for support back navigation
  useEffect(() => {
    if (!searchParams.get("type")) {
      searchParams.set("type", isGraphqlClientSupported ? "user" : "all");
      setSearchParams(searchParams, {replace: true});
    }
  }, [isGraphqlClientSupported, searchParams, setSearchParams]);

  const toggleUserTxnOnly = () => {
    if (allTxnOnly) {
      searchParams.set("type", "user");
      searchParams.delete("start");
      setSearchParams(searchParams);
    } else {
      searchParams.set("type", "all");
      searchParams.delete("page");
      setSearchParams(searchParams);
    }
  };

  return (
    <Box>
      <PageMetadata
        title="Transactions"
        description="Browse recent transactions on the Aptos blockchain. View transaction details, type, gas fees, sender and receiver addresses, events, and status. Real-time transaction monitoring."
        type="website"
        keywords={[
          "transactions",
          "tx",
          "transfer",
          "gas fees",
          "blockchain activity",
          "real-time",
        ]}
        canonicalPath="/transactions"
      />
      <PageHeader />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" component="h1" marginBottom={2}>
          {allTxnOnly ? "All Transactions" : "User Transactions"}
        </Typography>
        {isGraphqlClientSupported && (
          <Button onClick={toggleUserTxnOnly} variant="text">
            {allTxnOnly ? `View User Transactions` : `View All Transactions`}
          </Button>
        )}
      </Stack>
      {allTxnOnly ? <AllTransactions /> : <UserTransactions />}
    </Box>
  );
}
