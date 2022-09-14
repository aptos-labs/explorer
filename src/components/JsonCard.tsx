import React, {useState} from "react";
import {Box, useTheme} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmptyValue from "../pages/Transaction/Tabs/Components/EmptyValue";

const TEXT_COLOR_LIGHT = "#0EA5E9";
const TEXT_COLOR_DARK = "#83CCED";
const BACKGROUND_COLOR = "rgba(14,165,233,0.1)";

type JsonCardProps = {
  data: any;
};

export default function JsonCard({data}: JsonCardProps): JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!data) {
    return <EmptyValue />;
  }

  const jsonLineCount = JSON.stringify(data, null, 2).split("\n").length;
  const expandable = jsonLineCount >= 5;

  const toggleCard = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      onClick={toggleCard}
      sx={{
        color:
          theme.palette.mode === "dark" ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT,
        backgroundColor: BACKGROUND_COLOR,
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
      <Box
        sx={{
          overflowX: "auto",
          overflowY: expanded ? "auto" : "hidden",
        }}
        maxHeight={expandable && !expanded ? 60 : ""}
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
          {JSON.stringify(data, null, 2)}
        </pre>
      </Box>
      {expandable && (
        <Box
          sx={{
            marginTop: expanded ? 0 : 1,
            textAlign: "center",
          }}
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
