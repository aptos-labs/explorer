import {Stack, Typography} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo} from "../../../api";
import {
  useAptosClient,
  useNetworkValue,
} from "../../../global-config/GlobalConfig";
import {useTranslation} from "../../../i18n";

export default function TotalTransactions() {
  const {t, formatInteger} = useTranslation();
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
      <Typography
        variant="body2"
        sx={{
          alignSelf: "flex-end",
        }}
      >
        {t("analytics.totalTransactionsLabel", {
          count: ledgerVersion
            ? formatInteger(parseInt(ledgerVersion, 10))
            : "-",
        })}
      </Typography>
    </Stack>
  );
}
