import React, {useEffect, useState} from "react";
import {useGetEpochTime} from "../../../api/hooks/useGetEpochTime";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import moment from "moment";
import {parseTimestamp} from "../../utils";
import {Typography, Stack, useTheme} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";

export default function Staking() {
  return (
    <MetricSection>
      <Stack direction="row" spacing={0.7} alignItems="center">
        <Subtitle>829,615,127</Subtitle>
        <Body color="inherit">Staked</Body>
      </Stack>
      <Body>7% rewards per year</Body>
    </MetricSection>
  );
}
