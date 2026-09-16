import {Box, Stack} from "@mui/material";
import {useGetFullnodeCount} from "../../../api/hooks/useGetFullnodeCount";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {useTranslation} from "../../../i18n";
import {DoubleMetricCard} from "./MetricCard";

export default function ActiveNodes() {
  const {t, formatInteger} = useTranslation();
  const {latestNodeCount} = useGetFullnodeCount();
  const {numberOfActiveValidators} = useGetValidatorSet();

  return (
    <DoubleMetricCard
      data1={
        numberOfActiveValidators ? formatInteger(numberOfActiveValidators) : "-"
      }
      data2={latestNodeCount ? formatInteger(latestNodeCount) : "-"}
      label1={t("analytics.validators")}
      label2={t("analytics.fullnodes")}
      cardLabel={t("analytics.activeNodes")}
      tooltip={
        <Stack spacing={1}>
          <Box>
            <Box sx={{fontWeight: 700}}>{t("analytics.activeValidators")}</Box>
            <Box>{t("analytics.activeValidatorsTip")}</Box>
          </Box>
          <Box>
            <Box sx={{fontWeight: 700}}>{t("analytics.activeFullnodes")}</Box>
            <Box>{t("analytics.activeFullnodesTip")}</Box>
          </Box>
        </Stack>
      }
    />
  );
}
