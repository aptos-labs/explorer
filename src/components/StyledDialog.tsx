import {Dialog, DialogProps, IconButton, Stack} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {grey} from "../themes/colors/aptosColorPalette";

interface StyledDialogProps extends DialogProps {
  handleDialogClose: () => void;
  children: React.ReactNode;
}

export default function StyledDialog({
  handleDialogClose,
  children,
  ...props
}: StyledDialogProps) {
  return (
    <Dialog onClose={handleDialogClose} {...props}>
      <IconButton
        onClick={handleDialogClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: grey[450],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Stack sx={{marginX: 4, marginY: 4}}>{children}</Stack>
    </Dialog>
  );
}
