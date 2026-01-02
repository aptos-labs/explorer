import React from "react";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import Button from "@mui/material/Button";
import {Types} from "aptos";
import {getTransactions} from "../../api";
import {
  useNetworkValue,
  useAptosClient,
} from "../../global-config/GlobalConfig";
import Box from "@mui/material/Box";
import * as RRD from "@tanstack/react-router";
import {Stack, Typography, CircularProgress} from "@mui/material";
import TransactionsTable from "../Transactions/TransactionsTable";
import {useAugmentToWithGlobalSearchParams} from "../../routing";
import {ResponseError, ResponseErrorType} from "../../api/client";
import TransactionsError from "../Transactions/Error";

const PREVIEW_LIMIT = 10;

function TransactionContent({
  data,
  isLoading,
  error,
}: UseQueryResult<Array<Types.Transaction>, ResponseError>) {
  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    // Convert Error to ResponseError if needed
    const responseError: ResponseError =
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      typeof (error as {type: unknown}).type === "string"
        ? (error as ResponseError)
        : {
            type: ResponseErrorType.UNHANDLED,
            message:
              typeof error === "object" && error !== null && "message" in error
                ? String((error as {message: unknown}).message)
                : String(error),
          };
    return <TransactionsError error={responseError} />;
  }

  if (!data) {
    return null;
  }

  return <TransactionsTable transactions={data} />;
}

export default function TransactionsPreview() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const limit = PREVIEW_LIMIT;
  const result = useQuery<Array<Types.Transaction>, ResponseError>({
    queryKey: ["transactionsPreview", {limit}, networkValue],
    queryFn: () => getTransactions({limit}, aptosClient),
  });
  const augmentTo = useAugmentToWithGlobalSearchParams();

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h5">All Transactions</Typography>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <TransactionContent {...result} />
        </Box>

        <Box sx={{display: "flex", justifyContent: "center"}}>
          <Button
            component={RRD.Link}
            to={augmentTo("/transactions")}
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
