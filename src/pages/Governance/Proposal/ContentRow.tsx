import React from "react";
import {Typography, Stack} from "@mui/material";

interface ContentRowProps {
  title: React.ReactNode;
  text: React.ReactNode;
  i?: any;
}

export default function ContentRow({title, text, i}: ContentRowProps) {
  console.log(text);
  return (
    <Stack direction="column" key={i} spacing={2}>
      <Typography noWrap variant="subtitle1">
        {title}
      </Typography>
      <Typography style={{wordWrap: "break-word"}}>{text}</Typography>
    </Stack>
  );
}
