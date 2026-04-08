import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {Stack, Typography, useTheme} from "@mui/material";
import type * as React from "react";
import StyledTooltip from "../../../components/StyledTooltip";

type ChartTitleProps = {
  label: string;
  tooltip: NonNullable<React.ReactNode>;
};

export default function ChartTitle({label, tooltip}: ChartTitleProps) {
  const theme = useTheme();
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
      <Typography sx={{fontSize: 12}}>{label}</Typography>
      <StyledTooltip title={tooltip} placement="top">
        <InfoOutlinedIcon
          sx={{fontSize: 15, color: theme.palette.text.secondary}}
        />
      </StyledTooltip>
    </Stack>
  );
}
