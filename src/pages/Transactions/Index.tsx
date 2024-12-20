import {useSearchParams} from "react-router-dom";
import {Box, Button, Stack, Typography} from "@mui/material";
import PageHeader from "../layout/PageHeader";
import AllTransactions from "./AllTransactions";
import UserTransactions from "./UserTransactions";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {useEffect} from "react";

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const allTxnOnly = searchParams.get("type") === "all";

  usePageMetadata({title: "Transactions"});

  // Initial search params setup with replace for support back navigation
  useEffect(() => {
    if (isGraphqlClientSupported && !searchParams.get("type")) {
      searchParams.set("type", "user");
      return setSearchParams(searchParams, {replace: true});
    }

    if (!isGraphqlClientSupported && !searchParams.get("type")) {
      searchParams.set("type", "all");
      return setSearchParams(searchParams, {replace: true});
    }
  }, [isGraphqlClientSupported, searchParams, setSearchParams, allTxnOnly]);

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
      <PageHeader />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" marginBottom={2}>
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
