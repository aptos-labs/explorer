import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import * as RRD from "react-router-dom";
import {Stack} from "@mui/material";
import {UserTransactionsTable} from "../Transactions/TransactionsTable";
import useGetUserTransactionVersions from "../../api/hooks/useGetUserTransactionVersions";
import TransactionsPreview from "./TransactionsPreview";

const PREVIEW_TRANSACTIONS_COUNT = 10;

export default function UserTransactionsPreview() {
  const versions = useGetUserTransactionVersions(PREVIEW_TRANSACTIONS_COUNT);

  // TODO: remove the fallback below when indexer is stable
  if (versions.length === 0) {
    return <TransactionsPreview />;
  }

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} />
        </Box>
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <Button
            component={RRD.Link}
            to="/transactions"
            variant="primary"
            sx={{margin: "0 auto", mt: 6}}
          >
            View all Transactions
          </Button>
        </Box>
      </Stack>
    </>
  );
}
