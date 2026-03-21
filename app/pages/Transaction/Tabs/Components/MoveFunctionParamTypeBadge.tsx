import {Chip, Tooltip, Typography, useTheme} from "@mui/material";
import {getParamTypeDisplay} from "./moveParamTypeDisplay";

type MoveFunctionParamTypeBadgeProps = {
  typeStr: string;
  /**
   * Layout and plain (non-chip) type color:
   * - `functionArgTable`: function-args table — monospace plain types use primary (legacy).
   * - `typeArgTable`: type-args value column — plain types use default table text color.
   * - `card`: stacked mobile card — slightly smaller chip; plain types use primary.
   */
  variant?: "functionArgTable" | "typeArgTable" | "card";
};

export default function MoveFunctionParamTypeBadge({
  typeStr,
  variant = "functionArgTable",
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
    const plainColor =
      variant === "typeArgTable" ? undefined : theme.palette.primary.main;
    return (
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontFamily: "monospace",
          ...(plainColor !== undefined ? {color: plainColor} : {}),
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
      {variant === "card" ? (
        chip
      ) : (
        <span style={{display: "inline-flex", maxWidth: "100%"}}>{chip}</span>
      )}
    </Tooltip>
  );
}
