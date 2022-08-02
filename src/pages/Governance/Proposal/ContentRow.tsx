import React from "react";
import {Typography, Stack} from "@mui/material";

type ContentRowProps = {
  title: React.ReactNode;
  text: React.ReactNode;
};

export default function ContentRow({title, text}: ContentRowProps) {
  return (
    <Stack direction="column" spacing={2}>
      <Typography noWrap variant="subtitle1">
        {title}
      </Typography>
      <Typography style={{wordWrap: "break-word"}}>{text}</Typography>
    </Stack>
  );
}
