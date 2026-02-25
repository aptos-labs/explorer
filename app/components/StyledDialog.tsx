import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  type DialogProps,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import type React from "react";

interface StyledDialogProps extends DialogProps {
  handleDialogClose: () => void;
  children: React.ReactNode;
}

export default function StyledDialog({
  handleDialogClose,
  children,
  ...props
}: StyledDialogProps) {
  const theme = useTheme();
  return (
    <Dialog onClose={handleDialogClose} {...props}>
      <IconButton
        aria-label="Close"
        onClick={handleDialogClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: theme.palette.text.secondary,
        }}
      >
        <CloseIcon />
      </IconButton>
      <Stack sx={{marginX: 4, marginY: 4}}>{children}</Stack>
    </Dialog>
  );
}
