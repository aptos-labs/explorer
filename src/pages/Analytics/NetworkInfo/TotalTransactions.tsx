import React from "react";
import {useQuery} from "@tanstack/react-query";
import {
  useNetworkValue,
  useAptosClient,
} from "../../../global-config/GlobalConfig";
import {getLedgerInfo} from "../../../api";
import {Stack, Typography} from "@mui/material";

export default function TotalTransactions() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
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
