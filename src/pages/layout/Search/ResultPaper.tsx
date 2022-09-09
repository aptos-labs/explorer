import React from "react";
import Paper from "@mui/material/Paper";
import {useTheme} from "@mui/material/styles";
type PaperComponentProps = {
  children: React.ReactNode;
};

export default function ResultPaper({children}: PaperComponentProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        borderTop: "0",
        p: 1,
        mx: 0.5,
        transform: "translateY(2px)",
        borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
        boxShadow: "0px 8px 8px -3px rgba(0,0,0,0.2)",
        zIndex: "200",
        position: "relative",
        "&.MuiPaper-root .MuiAutocomplete-listbox .MuiAutocomplete-option": {
          padding: 0,
          minHeight: 0,
        },
        "&.MuiPaper-root .MuiAutocomplete-listbox .MuiAutocomplete-option.Mui-focused":
          {
            background: "transparent",
          },
        "&.MuiPaper-root .MuiAutocomplete-listbox .MuiAutocomplete-option .MuiLink-root":
          {
            padding: 1,
            width: "100%",
          },
      }}
    >
      {children}
    </Paper>
  );
}
