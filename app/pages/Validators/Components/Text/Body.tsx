import {Typography, TypographyProps} from "@mui/material";
import React from "react";
import {useTheme} from "@mui/material";
import {fontSizeBody, fontSizeBodySmall} from "../../constants";

interface BodyProps extends TypographyProps {
  children: string;
}

export default function Body({children, ...props}: BodyProps) {
  const theme = useTheme();
  return (
    <Typography
      sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeBody}}}
      color={theme.palette.text.secondary}
      {...props}
    >
      {children}
    </Typography>
  );
}
