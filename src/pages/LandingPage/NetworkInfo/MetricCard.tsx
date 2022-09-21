import React from "react";
import {Typography, Stack} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import Card from "./Card";

type MetricCardProps = {
  data: string;
  label: string;
};

export default function MetricCard({data, label}: MetricCardProps) {
  return (
    <Card>
      <Stack alignItems="flex-end" spacing={2.5} marginTop={2}>
        <Typography fontSize={17} fontWeight={700}>
          {data}
        </Typography>
        <Typography fontSize={13} color={grey[450]}>
          {label}
        </Typography>
      </Stack>
    </Card>
  );
}
