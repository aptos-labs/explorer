import React from "react";
import {useQuery} from "@tanstack/react-query";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {getLedgerInfo} from "../../../api";
import {Stack, Typography} from "@mui/material";
import MetricCard from "./MetricCard";

export default function TotalTransactions(
  props: {type: "card" | "inline" | null} = {type: "inline"},
) {
  const [state] = useGlobalState();
  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.aptos_client),
    refetchInterval: 10000,
  });
  const ledgerVersion = ledgerData?.ledger_version;

  return (
    <Stack direction="column">
      {props.type && props.type === "card" ? (
        <MetricCard
          data={
            ledgerVersion
              ? parseInt(ledgerVersion).toLocaleString("en-US")
              : "-"
          }
          label="TOTAL TRANSACTIONS"
          tooltip="Total Transactions on Movement network."
        />
      ) : (
        <Typography variant="body2" alignSelf="flex-end">
          {`TOTAL TRANSACTIONS: ${
            ledgerVersion
              ? parseInt(ledgerVersion).toLocaleString("en-US")
              : "-"
          }`}
        </Typography>
      )}
    </Stack>
  );
}
