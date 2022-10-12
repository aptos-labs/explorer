import React, {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Box, Button, Stack, Typography} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import AllTransactions from "./AllTransactions";
import UserTransactions from "./UserTransactions";

export default function TransactionsPage() {
  const [userTxnOnly, setUserTxnOnly] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  console.log(searchParams.get("start"));
  console.log(searchParams.get("feature"));
  console.log(searchParams.get("network"));

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
