import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {Box, Grid, Stack, Typography, useTheme} from "@mui/material";
import type React from "react";

type CollapsibleCardProps = {
  titleKey: string;
  titleValue: string;
  children: React.ReactNode;
  expanded: boolean;
  toggleExpanded: () => void;
};

export default function CollapsibleCard({
  expanded,
  titleKey,
  titleValue,
  children,
  toggleExpanded,
  ...props
}: CollapsibleCardProps) {
  const theme = useTheme();
  const titleBackgroundColor =
    theme.palette.mode === "dark"
      ? theme.palette.neutralShade.lighter
      : theme.palette.neutralShade.darker;
  const contentBackgroundColor = theme.palette.background.paper;

  return (
    <Box {...props}>
      <Box
        sx={{
          paddingX: 4,
          paddingY: 2,
          color: theme.palette.text.secondary,
          backgroundColor: titleBackgroundColor,
          borderRadius: expanded ? "10px 10px 0px 0px" : "10px 10px 10px 10px",
        }}
        onClick={toggleExpanded}
      >
        <Grid
          container
          rowSpacing={1}
          columnSpacing={4}
          sx={{flexDirection: {xs: "column", md: "row"}}}
        >
          <Grid size={{md: 3}}>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              {titleKey}
            </Typography>
          </Grid>
          <Grid
            size={{md: 9}}
            sx={{
              width: {xs: 1, md: 0.75},
              fontSize: 13.5,
              overflow: "hidden",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            <Stack direction="row" sx={{justifyContent: "space-between"}}>
              {titleValue}
              {expanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
      {expanded && (
        <Box
          sx={{
            padding: 4,
            backgroundColor: contentBackgroundColor,
            borderRadius: "0px 0px 10px 10px",
          }}
        >
          <Stack direction="column" spacing={2}>
            {children}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
