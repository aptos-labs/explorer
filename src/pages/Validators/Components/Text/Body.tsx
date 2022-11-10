import {Typography, TypographyProps} from "@mui/material";
import React from "react";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {fontSizeBody, fontSizeBodySmall} from "../../constants";

interface BodyProps extends TypographyProps {
  children: string;
}

export default function Body({children, ...props}: BodyProps) {
  return (
    <Typography
      sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeBody}}}
      color={grey[450]}
      {...props}
    >
      {children}
    </Typography>
  );
}
