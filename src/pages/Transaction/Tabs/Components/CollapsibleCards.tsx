import React from "react";
import {Stack, Typography, useTheme, Box, Button} from "@mui/material";
import {grey} from "../../../../themes/colors/aptosColorPalette";

// return true if there is at least 1 card is not expanded
function getNotAllExpanded(expandedList: boolean[]): boolean {
  return expandedList.find((expanded) => expanded === false) !== undefined;
}

// return true if there is at least 1 card is expanded
function getNotAllCollapse(expandedList: boolean[]): boolean {
  return expandedList.find((expanded) => expanded === true) !== undefined;
}

type CollapsibleCardsProps = {
  expandedList: boolean[];
  expandAll: () => void;
  collapseAll: () => void;
  children: React.ReactNode;
};

export default function CollapsibleCards({
  expandedList,
  expandAll,
  collapseAll,
  children,
}: CollapsibleCardsProps) {
  const theme = useTheme();

  const heavyTextColor = grey[450];
  const lightTextColor = theme.palette.mode === "dark" ? grey[600] : grey[300];

  const enableExpandAllButton = getNotAllExpanded(expandedList);
  const enableCollapseAllButton = getNotAllCollapse(expandedList);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        marginBottom={1}
      >
        <Button
          variant="text"
          disabled={!enableExpandAllButton}
          onClick={expandAll}
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: enableExpandAllButton ? heavyTextColor : lightTextColor,
            padding: 0,
            "&:hover": {
              background: "transparent",
            },
            "&:disabled": {
              color: enableExpandAllButton ? heavyTextColor : lightTextColor,
            },
          }}
        >
          Expand All
        </Button>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: heavyTextColor,
          }}
        >
          |
        </Typography>
        <Button
          variant="text"
          disabled={!enableCollapseAllButton}
          onClick={collapseAll}
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: enableCollapseAllButton ? heavyTextColor : lightTextColor,
            padding: 0,
            "&:hover": {
              background: "transparent",
            },
            "&:disabled": {
              color: enableCollapseAllButton ? heavyTextColor : lightTextColor,
            },
          }}
        >
          Collapse All
        </Button>
      </Stack>
      <Stack direction="column" spacing={1}>
        {children}
      </Stack>
    </Box>
  );
}
