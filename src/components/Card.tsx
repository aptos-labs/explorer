import React from "react";
import {Box, useTheme} from "@mui/material";

interface CardProps {
  children?: React.ReactNode;
}

export default function Card({children}: CardProps) {
  const theme = useTheme();
  return (
    <Box position="relative">
      <Box
        component="div"
        sx={{top: "0.5rem", left: "-0.5rem", zIndex: "-10"}}
        height="100%"
        width="100%"
        position="absolute"
        borderRadius={1}
        border="1px solid gray"
      />
      <Box
        component="div"
        sx={{
          p: 3,
          flexGrow: 1,
          backgroundColor:
            theme.palette.mode === "dark" ? "#1B1F1E" : "#f5f5f5",
        }} // {theme.palette.mode === "dark" ? "bumpDark" : "bump"}
        borderRadius={1}
        border="1px solid gray"
      >
        {children}
      </Box>
    </Box>
  );
}
