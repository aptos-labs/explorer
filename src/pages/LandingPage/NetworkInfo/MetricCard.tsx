import React from "react";
import {Typography, Stack} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import Card from "./Card";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StyledTooltip from "../../../components/StyledTooltip";

function MetricCardComponent({
  children,
  label,
  tooltipText,
}: {
  children: React.ReactNode;
  label: string;
  tooltipText: string;
}) {
  return (
    <Card height={120}>
      <Stack alignItems="flex-end" spacing={2.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12} color={grey[450]}>
            {label}
          </Typography>
          <StyledTooltip title={tooltipText} placement="bottom-end">
            <InfoOutlinedIcon sx={{fontSize: 15, color: grey[450]}} />
          </StyledTooltip>
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}

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
    <MetricCardComponent label={label} tooltipText={tooltipText}>
      <Typography fontSize={20} fontWeight={400}>
        {data}
      </Typography>
    </MetricCardComponent>
  );
}
