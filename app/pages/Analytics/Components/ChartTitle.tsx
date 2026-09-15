import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {Stack, Typography, useTheme} from "@mui/material";
import type * as React from "react";
import StyledTooltip from "../../../components/StyledTooltip";
import {useTranslation} from "../../../i18n";

type ChartTitleProps = {
  label?: string;
  labelKey?: string;
  tooltip?: NonNullable<React.ReactNode>;
  tooltipKey?: string;
};

export default function ChartTitle({
  label,
  labelKey,
  tooltip,
  tooltipKey,
}: ChartTitleProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  const displayLabel = labelKey ? t(labelKey) : (label ?? "");
  const displayTooltip = tooltipKey ? t(tooltipKey) : tooltip;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        alignSelf: "flex-start",
        marginBottom: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
        }}
      >
        {displayLabel}
      </Typography>
      {displayTooltip != null ? (
        <StyledTooltip title={displayTooltip} placement="top">
          <InfoOutlinedIcon
            sx={{fontSize: 15, color: theme.palette.text.secondary}}
          />
        </StyledTooltip>
      ) : null}
    </Stack>
  );
}
