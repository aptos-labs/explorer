import {Box, useTheme, alpha} from "@mui/material";
import React from "react";
import ReactJson from "react-json-view";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

const TRANSPARENT = "rgba(0,0,0,0)";

const GROUP_ARRAYS_AFTER_LENGTH = 100;
const COLLAPSE_STRINGS_AFTER_LENGTH = 80;
const MAX_CARD_HEIGHT = 500;

function useJsonViewCardTheme() {
  const theme = useTheme();
  const textColor = theme.palette.primary.main;
  const secondaryTextColor = alpha(theme.palette.primary.main, 0.3);

  return {
    scheme: "aptos_explorer",
    author: "aptos",
    base00: TRANSPARENT,
    base01: textColor,
    base02: secondaryTextColor, // line color
    base03: textColor,
    base04: secondaryTextColor, // item count color
    base05: textColor,
    base06: textColor,
    base07: textColor, // key color
    base08: textColor,
    base09: textColor, // value and data type color
    base0A: textColor,
    base0B: textColor,
    base0C: textColor,
    base0D: secondaryTextColor, // object triangle color
    base0E: secondaryTextColor, // array triangle color
    base0F: textColor, // copy icon color
  };
}

type JsonViewCardProps = {
  data: unknown;
  collapsedByDefault?: boolean;
};

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const jsonViewCardTheme = useJsonViewCardTheme();

  if (!data) {
    return <EmptyValue />;
  }

  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        overflow: "auto",
        maxHeight: MAX_CARD_HEIGHT,
      }}
      padding={2}
      borderRadius={1}
    >
      <ReactJson
        src={data}
        theme={jsonViewCardTheme}
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
