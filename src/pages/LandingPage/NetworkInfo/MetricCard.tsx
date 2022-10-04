import React from "react";
import {Typography, Stack} from "@mui/material";
import {
  aptosColorOpacity,
  grey,
} from "../../../themes/colors/aptosColorPalette";
import Card from "./Card";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StyledTooltip from "../../../components/StyledTooltip";

type MetricCardProps = {
  data: string;
  label: string;
  tooltipText: string;
};

export default function MetricCard({
  data,
  label,
  tooltipText,
}: MetricCardProps) {
  return (
    <Card effectColor={aptosColorOpacity}>
      <Stack alignItems="flex-end" spacing={2.5} marginTop={2}>
        <Typography fontSize={20} fontWeight={400}>
          {data}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12} color={grey[450]}>
            {label}
          </Typography>
          <StyledTooltip title={tooltipText} placement="bottom-end">
            <InfoOutlinedIcon sx={{fontSize: 15, color: grey[450]}} />
          </StyledTooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
