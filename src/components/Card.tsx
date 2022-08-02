import React from "react";
import {Box} from "@mui/material";

interface CardProps {
  children?: React.ReactNode;
}

export default function Card({children}: CardProps) {
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
      ></Box>
      <Box
        component="div"
        sx={{p: 2, flexGrow: 1, backgroundColor: "#151515"}}
        borderRadius={1}
        border="1px solid gray"
      >
        {children}
      </Box>
    </Box>
  );
}
