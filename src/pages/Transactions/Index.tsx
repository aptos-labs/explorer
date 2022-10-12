import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Box, Button, Stack, Typography} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import AllTransactions from "./AllTransactions";
import UserTransactions from "./UserTransactions";

export default function TransactionsPage() {
  const [userTxnOnly, setUserTxnOnly] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (userTxnOnly) {
      searchParams.set("type", "user");
      searchParams.delete("start");
      setSearchParams(searchParams);
    } else {
      searchParams.set("type", "all");
      searchParams.delete("page");
      setSearchParams(searchParams);
    }
  }, [userTxnOnly]);

  const toggleUserTxnOnly = () => {
    setUserTxnOnly(!userTxnOnly);
  };

  return (
    <Box>
      <PageHeader />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" marginBottom={2}>
          {userTxnOnly ? "User Transactions" : "All Transactions"}
        </Typography>
        <Button onClick={toggleUserTxnOnly} variant="text">
          {userTxnOnly ? `View All Transactions` : `View User Transactions`}
        </Button>
      </Stack>
      {userTxnOnly ? <UserTransactions /> : <AllTransactions />}
    </Box>
  );
}
