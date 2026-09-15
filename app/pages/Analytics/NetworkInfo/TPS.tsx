import {Box, Stack} from "@mui/material";
import {useGetPeakTPS, useGetTPS} from "../../../api/hooks/useGetTPS";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {useTranslation} from "../../../i18n";
import MetricCard, {DoubleMetricCard} from "./MetricCard";

function getFormattedTPS(tps: number) {
  const tpsWithDecimal = parseFloat(tps.toFixed(0));
  return tpsWithDecimal.toLocaleString("en-US");
}

export default function TPS() {
  const {t} = useTranslation();
  const {tps} = useGetTPS();
  const {peakTps} = useGetPeakTPS();
  const networkName = useNetworkName();

  // Calculate showPeakTps during render instead of using useEffect
  const showPeakTps = networkName === "mainnet";

  return showPeakTps ? (
    <DoubleMetricCard
      data1={tps ? getFormattedTPS(tps) : "-"}
      data2={peakTps ? getFormattedTPS(peakTps) : "-"}
      label1={t("analytics.realtime")}
      label2={t("analytics.peakLast30Days")}
      cardLabel={t("analytics.tps")}
      tooltip={
        <Stack spacing={1}>
          <Box>
            <Box sx={{fontWeight: 700}}>{t("analytics.realTimeHeading")}</Box>
            <Box>{t("analytics.tpsTip")}</Box>
          </Box>
          <Box>
            <Box sx={{fontWeight: 700}}>
              {t("analytics.peakLast30DaysHeading")}
            </Box>
            <Box>{t("analytics.peakLast30DaysNetworkTip")}</Box>
          </Box>
        </Stack>
      }
    />
  ) : (
    <MetricCard
      data={tps ? getFormattedTPS(tps) : "-"}
      label={t("analytics.tps")}
      tooltip={t("analytics.tpsTip")}
    />
  );
}
