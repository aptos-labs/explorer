import React from "react";
import {useQuery} from "@tanstack/react-query";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {getLedgerInfo} from "../../../api";
import {Stack, Typography} from "@mui/material";

export default function TotalTransactions() {
  const [state] = useGlobalState();
  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.sdk_v2_client),
    refetchInterval: 10000,
  });
  const ledgerVersion = ledgerData?.ledger_version;

  return (
    <Stack direction="column">
      <Typography variant="body2" alignSelf="flex-end">
        {`TOTAL TRANSACTIONS: ${
          ledgerVersion ? parseInt(ledgerVersion).toLocaleString("en-US") : "-"
        }`}
      </Typography>
    </Stack>
  );
}
