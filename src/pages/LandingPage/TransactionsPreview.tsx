import React from "react";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import Button from "@mui/material/Button";
import {getTransactions} from "../../api";
import {useGlobalState} from "../../global-config/GlobalConfig";
import Box from "@mui/material/Box";
import * as RRD from "react-router-dom";
import {Stack} from "@mui/material";
import TransactionsTable from "../Transactions/TransactionsTable";
import {useAugmentToWithGlobalSearchParams} from "../../routing";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

const PREVIEW_LIMIT = 10;

function TransactionContent({
  data,
}: UseQueryResult<Array<TransactionResponse>>) {
  if (!data) {
    // TODO: error handling!
    return null;
  }

  return <TransactionsTable transactions={data} />;
}

export default function TransactionsPreview() {
  const [state] = useGlobalState();
  const limit = PREVIEW_LIMIT;
  const result = useQuery({
    queryKey: ["transactions", {limit}, state.network_value],
    queryFn: () => getTransactions({limit}, state.sdk_v2_client),
  });
  const augmentTo = useAugmentToWithGlobalSearchParams();

  return (
    <>
      <Stack spacing={2}>
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
