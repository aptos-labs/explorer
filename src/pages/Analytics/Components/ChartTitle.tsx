import {Stack, Typography} from "@mui/material";
import * as React from "react";
import StyledTooltip from "../../../components/StyledTooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {grey} from "../../../themes/colors/aptosColorPalette";

type ChartTitleProps = {
  label: string;
  tooltip: NonNullable<React.ReactNode>;
};

export default function ChartTitle({label, tooltip}: ChartTitleProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      alignSelf="flex-start"
      marginBottom={2}
    >
      <Typography fontSize={12}>{label}</Typography>
      <StyledTooltip title={tooltip} placement="top">
        <InfoOutlinedIcon sx={{fontSize: 15, color: grey[450]}} />
      </StyledTooltip>
    </Stack>
  );
}
