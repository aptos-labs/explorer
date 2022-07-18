import React from "react";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { Button } from "@mui/material";

interface PrimaryButtonProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fullWidth?: boolean
}

export default function PrimaryButton(props: PrimaryButtonProps) {
  return (
    <Button
      sx={{ backgroundColor: 'rgb(29, 233, 182)', color: 'black', padding: '10px 30px', ...props.sx }}
      color="primary"
      onClick={props.onClick}
      disabled={props.disabled}
      fullWidth={props.fullWidth}
    >
      {props.children}
    </Button>
  );
}
