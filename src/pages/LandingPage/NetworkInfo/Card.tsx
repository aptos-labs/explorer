import React from "react";
import {Paper} from "@mui/material";

type CardProps = {
  children: React.ReactNode;
};

export default function Card({children, ...props}: CardProps) {
  return (
    <Paper elevation={3} sx={{height: 120, padding: 2}} {...props}>
      {children}
    </Paper>
  );
}
