import {Stack} from "@mui/material";
import {CodeLineBox} from "../../../components/CodeLineBox";
import TableTooltip from "../../../components/Table/TableTooltip";
import TooltipTypography from "../../../components/TooltipTypography";
import {useTranslation} from "../../../i18n";

export default function LastEpochPerformanceTooltip() {
  const {t} = useTranslation();
  return (
    <TableTooltip titleKey="fields.lastEpochPerformance">
      <Stack spacing={2}>
        <TooltipTypography variant="body2">
          {t("tooltips.lastEpochPerformanceBody1")}
        </TooltipTypography>
        <TooltipTypography variant="body2">
          {t("tooltips.lastEpochPerformanceBody2")}
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
          {t("tooltips.lastEpochPerformanceFormula")}
        </CodeLineBox>
        <TooltipTypography variant="body2">
          {t("tooltips.lastEpochPerformanceBody3")}
        </TooltipTypography>
      </Stack>
    </TableTooltip>
  );
}
