import React from "react";
import {CircularProgress, Modal, Box} from "@mui/material";

type LoadingModalProps = {
  open: boolean;
};

export default function LoadingModal({open}: LoadingModalProps) {
  return (
    <Modal open={open}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
        }}
      >
        <CircularProgress />
      </Box>
    </Modal>
  );
}
