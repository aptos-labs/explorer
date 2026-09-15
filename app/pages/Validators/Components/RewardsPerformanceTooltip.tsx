import {Stack} from "@mui/material";
import {CodeLineBox} from "../../../components/CodeLineBox";
import TableTooltip from "../../../components/Table/TableTooltip";
import TooltipTypography from "../../../components/TooltipTypography";
import {useTranslation} from "../../../i18n";

export default function RewardsPerformanceTooltip() {
  const {t} = useTranslation();
  return (
    <TableTooltip titleKey="fields.rewardsPerformance">
      <Stack spacing={2}>
        <TooltipTypography variant="body2">
          {t("tooltips.rewardsPerformanceBody1")}
        </TooltipTypography>
        <TooltipTypography variant="body2">
          {t("tooltips.rewardsPerformanceBody2")}
        </TooltipTypography>
        <CodeLineBox
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            fontSize: 13,
            padding: "0.3rem 0.5rem 0.3rem 0.5rem",
            width: "100%",
          }}
        >
          {t("tooltips.rewardsPerformanceFormula")}
        </CodeLineBox>
        <TooltipTypography variant="body2">
          {t("tooltips.rewardsPerformanceBody3")}
        </TooltipTypography>
      </Stack>
    </TableTooltip>
  );
}
