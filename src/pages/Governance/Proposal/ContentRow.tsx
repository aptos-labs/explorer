import React from "react";
import {Typography, Stack, Link} from "@mui/material";

type ContentRowProps = {
  title: React.ReactNode;
  text: React.ReactNode;
  link?: string;
};

export default function ContentRow({title, text, link}: ContentRowProps) {
  return (
    <Stack direction="column" spacing={2}>
      <Typography noWrap variant="h6">
        {title}
      </Typography>
      {link ? (
        <Link href={link} color="primary" target="_blank">
          {text}
        </Link>
      ) : (
        <Typography style={{wordWrap: "break-word"}}>{text}</Typography>
      )}
    </Stack>
  );
}
