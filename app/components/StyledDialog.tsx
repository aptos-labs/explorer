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
    <Dialog
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
      {...props}
      sx={[
        {
          "& .MuiDialog-paper": {
            margin: {xs: 2, sm: 4},
            width: {xs: "calc(100% - 32px)", sm: "calc(100% - 64px)"},
            maxHeight: {xs: "calc(100% - 32px)", sm: "calc(100% - 64px)"},
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
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
      <Stack sx={{marginX: {xs: 2, sm: 4}, marginY: {xs: 3, sm: 4}}}>
        {children}
      </Stack>
    </Dialog>
  );
}
