import React from "react";
import {Typography, Stack, useTheme} from "@mui/material";
import {CardWithStyle} from "../../../components/Card";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StyledTooltip from "../../../components/StyledTooltip";

function Data({children}: {children: React.ReactNode}) {
  return (
    <Typography fontSize={20} fontWeight={400}>
      {children}
    </Typography>
  );
}

function SubLabel({children}: {children: React.ReactNode}) {
  const theme = useTheme();
  return (
    <Typography fontSize={10} color={theme.palette.text.secondary}>
      {children}
    </Typography>
  );
}

function MetricCardComponent({
  children,
  label,
  tooltip,
}: {
  children: React.ReactNode;
  label: string;
  tooltip: NonNullable<React.ReactNode>;
}) {
  const theme = useTheme();
  return (
    <CardWithStyle height={120}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12}>{label}</Typography>
          <StyledTooltip title={tooltip} placement="top">
            <InfoOutlinedIcon
              sx={{fontSize: 15, color: theme.palette.text.secondary}}
            />
          </StyledTooltip>
        </Stack>
        {children}
      </Stack>
    </CardWithStyle>
  );
}

type MetricCardProps = {
  data: string;
  label: string;
  tooltip: NonNullable<React.ReactNode>;
};

export default function MetricCard({data, label, tooltip}: MetricCardProps) {
  return (
    <MetricCardComponent label={label} tooltip={tooltip}>
      <Data>{data}</Data>
    </MetricCardComponent>
  );
}

type DoubleMetricCardProps = {
  data1: string;
  data2: string;
  label1: string;
  label2: string;
  cardLabel: string;
  tooltip: NonNullable<React.ReactNode>;
};

export function DoubleMetricCard({
  data1,
  data2,
  label1,
  label2,
  cardLabel,
  tooltip,
}: DoubleMetricCardProps) {
  return (
    <MetricCardComponent label={cardLabel} tooltip={tooltip}>
      <Stack direction="row" width="100%">
        <Stack width="50%">
          <Data>{data1}</Data>
          <SubLabel>{label1}</SubLabel>
        </Stack>
        <Stack width="50%">
          <Data>{data2}</Data>
          <SubLabel>{label2}</SubLabel>
        </Stack>
      </Stack>
    </MetricCardComponent>
  );
}
