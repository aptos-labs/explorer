import {CircularProgress, Modal, Box} from "@mui/material";

type LoadingModalProps = {
  open: boolean;
};

export default function LoadingModal({open}: LoadingModalProps) {
  return (
    <Modal open={open} aria-label="Loading">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          outline: "0",
        }}
      >
        <CircularProgress aria-label="Loading" />
      </Box>
    </Modal>
  );
}
