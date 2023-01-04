import {Box, useTheme} from "@mui/material";
import React from "react";
import ReactJson from "react-json-view";
import EmptyValue from "./ContentValue/EmptyValue";

const TEXT_COLOR_LIGHT = "#0EA5E9";
const TEXT_COLOR_DARK = "#83CCED";
const SECONDARY_TEXT_COLOR = "rgba(14,165,233,0.3)";
const BACKGROUND_COLOR = "rgba(14,165,233,0.1)";
const TRANSPARENT = "rgba(0,0,0,0)";

const GROUP_ARRAYS_AFTER_LENGTH = 100;
const COLLAPSE_STRINGS_AFTER_LENGTH = 80;
const MAX_CARD_HEIGHT = 500;

function useJsonViewCardTheme() {
  const theme = useTheme();
  const textColor =
    theme.palette.mode === "dark" ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT;

  return {
    scheme: "aptos_explorer",
    author: "aptos",
    base00: TRANSPARENT,
    base01: textColor,
    base02: SECONDARY_TEXT_COLOR, // line color
    base03: textColor,
    base04: SECONDARY_TEXT_COLOR, // item count color
    base05: textColor,
    base06: textColor,
    base07: textColor, // key color
    base08: textColor,
    base09: textColor, // value and data type color
    base0A: textColor,
    base0B: textColor,
    base0C: textColor,
    base0D: SECONDARY_TEXT_COLOR, // object triangle color
    base0E: SECONDARY_TEXT_COLOR, // array triangle color
    base0F: textColor, // copy icon color
  };
}

type JsonViewCardProps = {
  data: any;
  collapsedByDefault?: boolean;
};

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();

  if (!data) {
    return <EmptyValue />;
  }

  return (
    <Box
      sx={{
        backgroundColor: BACKGROUND_COLOR,
        overflow: "auto",
        maxHeight: MAX_CARD_HEIGHT,
      }}
      padding={2}
      borderRadius={1}
    >
      <ReactJson
        src={data}
        theme={useJsonViewCardTheme()}
        name={null}
        collapseStringsAfterLength={COLLAPSE_STRINGS_AFTER_LENGTH}
        displayObjectSize={false}
        displayDataTypes={false}
        quotesOnKeys={false}
        groupArraysAfterLength={GROUP_ARRAYS_AFTER_LENGTH}
        style={{
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular,
          fontSize: theme.typography.fontSize,
        }}
        collapsed={collapsedByDefault}
      />
    </Box>
  );
}
