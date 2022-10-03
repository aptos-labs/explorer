import React from "react";
import {useQuery} from "react-query";
import {useGlobalState} from "../../../GlobalState";
import {getLedgerInfo} from "../../../api";
import {Stack, Divider, Typography} from "@mui/material";
import {aptosColor} from "../../../themes/colors/aptosColorPalette";

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
      <Typography variant="body2" sx={{color: aptosColor}} alignSelf="flex-end">
        {`TOTAL TRANSACTIONS: ${
          ledgerVersion ? parseInt(ledgerVersion).toLocaleString("en-US") : "-"
        }`}
      </Typography>
      <Divider sx={{mt: 0.5}} />
    </Stack>
  );
}
