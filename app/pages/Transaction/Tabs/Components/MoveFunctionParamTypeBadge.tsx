import {Chip, Tooltip, Typography, useTheme} from "@mui/material";
import {getParamTypeDisplay} from "./moveParamTypeDisplay";

type MoveFunctionParamTypeBadgeProps = {
  typeStr: string;
  /** When false, match legacy Typography styling (function args table). */
  variant?: "table" | "card";
};

export default function MoveFunctionParamTypeBadge({
  typeStr,
  variant = "table",
}: MoveFunctionParamTypeBadgeProps) {
  const theme = useTheme();
  const display = getParamTypeDisplay(typeStr);

  const chipSx = {
    fontFamily: "monospace",
    fontSize: variant === "card" ? "0.7rem" : "0.75rem",
    maxWidth: 240,
    height: "auto",
    minHeight: 24,
    "& .MuiChip-label": {
      display: "block",
      whiteSpace: "normal",
      textAlign: "left",
      lineHeight: 1.25,
      py: 0.5,
    },
  } as const;

  if (display.kind === "plain") {
    return (
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontFamily: "monospace",
          color: theme.palette.primary.main,
        }}
      >
        {display.text}
      </Typography>
    );
  }

  const chip = (
    <Chip
      label={display.label}
      size="small"
      variant="outlined"
      color="primary"
      sx={chipSx}
    />
  );

  return (
    <Tooltip title={display.tooltip} placement="top" enterDelay={300}>
      {variant === "table" ? (
        <span style={{display: "inline-flex", maxWidth: "100%"}}>{chip}</span>
      ) : (
        chip
      )}
    </Tooltip>
  );
}
