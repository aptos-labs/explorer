import React from "react";
import {useQuery} from "react-query";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {getLedgerInfo} from "../../../api";
import {Stack, Typography} from "@mui/material";

export default function TotalTransactions() {
  const [state, _] = useGlobalState();
  const {data: ledgerData} = useQuery(
    ["ledgerInfo", state.network_value],
    () => getLedgerInfo(state.network_value),
    {refetchInterval: 10000},
  );
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
