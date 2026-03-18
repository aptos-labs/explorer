import {Stack, Typography} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo} from "../../../api";
import {
  useAptosClient,
  useNetworkValue,
} from "../../../global-config/GlobalConfig";

export default function TotalTransactions() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const ledgerVersion = ledgerData?.ledger_version;

  return (
    <Stack direction="column">
      <Typography variant="body2" alignSelf="flex-end">
        {`TOTAL TRANSACTIONS: ${
          ledgerVersion
            ? parseInt(ledgerVersion, 10).toLocaleString("en-US")
            : "-"
        }`}
      </Typography>
    </Stack>
  );
}
