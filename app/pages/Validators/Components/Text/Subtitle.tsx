import {Typography} from "@mui/material";
import React from "react";
import {fontSizeSubtitle, fontSizeSubtitleSmall} from "../../constants";

type SubtitleProps = {
  children: string;
};

export default function Subtitle({children}: SubtitleProps) {
  return (
    <Typography
      sx={{fontSize: {xs: fontSizeSubtitleSmall, md: fontSizeSubtitle}}}
    >
      {children}
    </Typography>
  );
}
