import {Stack, Typography} from "@mui/material";
import {useGetLedgerInfo} from "../../../api/hooks/useGetLedgerInfo";

export default function TotalTransactions() {
  const {data: ledgerData} = useGetLedgerInfo();
  const ledgerVersion = ledgerData?.ledger_version;

  return (
    <Stack direction="column">
      <Typography
        variant="body2"
        sx={{
          alignSelf: "flex-end",
        }}
      >
        {`TOTAL TRANSACTIONS: ${
          ledgerVersion
            ? parseInt(ledgerVersion, 10).toLocaleString("en-US")
            : "-"
        }`}
      </Typography>
    </Stack>
  );
}
