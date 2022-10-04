import * as React from "react";
import Typography from "@mui/material/Typography";
import {useTheme} from "@mui/material";

interface ChildrenProps {
  children?: React.ReactNode;
}

export default function HeadingSub(props: ChildrenProps) {
  const theme = useTheme();

  return (
    <Typography
      color="secondary"
      variant="subtitle2"
      component="span"
      sx={{mb: 1}}
    >
      {props.children}
    </Typography>
  );
}
