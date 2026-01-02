import React from "react";
import {Stack} from "@mui/material";

type MetricSectionProps = {
  children: React.ReactNode;
};

export default function MetricSection({children}: MetricSectionProps) {
  return <Stack spacing={{xs: 0.2, md: 0.5}}>{children}</Stack>;
}
