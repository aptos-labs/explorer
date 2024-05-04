import React, {useState} from "react";
import {Box, useTheme, Stack, IconButton} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmptyValue from "./ContentValue/EmptyValue";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import StyledTooltip from "../StyledTooltip";
import {codeBlockColor} from "../../themes/colors/aptosColorPalette";

const TEXT_COLOR_LIGHT = "#0EA5E9";
const TEXT_COLOR_DARK = "#83CCED";
const CARD_HEIGHT = 60;
const EXPANDED_CARD_HEIGHT = 500;
const TOOLTIP_TIME = 2000; // 2s

type JsonCardProps = {
  data: any;
  expandedByDefault?: boolean;
};

export default function JsonCard({
  data,
  expandedByDefault,
}: JsonCardProps): JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<boolean>(expandedByDefault === true);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  if (!data) {
    return <EmptyValue />;
  }

  const jsonData = JSON.stringify(data, null, 2);
  const jsonLineCount = jsonData.split("\n").length;
  const expandable = jsonLineCount >= 5;
  const showCopyIcon = jsonLineCount >= 2;

  const toggleCard = () => {
    setExpanded(!expanded);
  };

  const expandCard = () => {
    if (!expanded) {
      setExpanded(true);
    }
  };

  const copyCard = async () => {
    await navigator.clipboard.writeText(jsonData);

    setTooltipOpen(true);

    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  };

  return (
    <Box
      sx={{
        color:
          theme.palette.mode === "dark" ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT,
        backgroundColor: codeBlockColor,
        "&:hover": {
          boxShadow: expandable ? "1px 1px 3px 3px rgba(0, 0, 0, 0.05)" : "",
        },
      }}
      paddingX={1.5}
      paddingTop={1.5}
      paddingBottom={expandable ? 0 : 1.5}
      marginBottom="5px"
      marginRight="5px"
      borderRadius={1}
    >
      <Stack direction="row" justifyContent="space-between">
        <Box
          onClick={expandCard}
          sx={{
            overflow: expanded ? "auto" : "hidden",
            width: "100%",
          }}
          maxHeight={
            expandable && !expanded ? CARD_HEIGHT : EXPANDED_CARD_HEIGHT
          }
        >
          <pre
            style={{
              margin: 0,
              fontFamily: theme.typography.fontFamily,
              fontWeight: theme.typography.fontWeightRegular,
              fontSize: 13,
              overflowWrap: "break-word",
            }}
          >
            {jsonData}
          </pre>
        </Box>
        {showCopyIcon && (
          <StyledTooltip
            title="Data copied"
            placement="right"
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <IconButton
              onClick={copyCard}
              sx={{
                color: "inherit",
                alignSelf: "flex-start",
              }}
            >
              <ContentCopyIcon sx={{fontSize: 15}} />
            </IconButton>
          </StyledTooltip>
        )}
      </Stack>
      {expandable && (
        <Box
          sx={{
            marginTop: expanded ? 0 : 1,
            textAlign: "center",
          }}
          onClick={toggleCard}
        >
          {expanded ? (
            <KeyboardArrowUpIcon color="inherit" fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon color="inherit" fontSize="small" />
          )}
        </Box>
      )}
    </Box>
  );
}
