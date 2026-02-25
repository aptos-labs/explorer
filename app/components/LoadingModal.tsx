import {Box, CircularProgress, Modal, Typography} from "@mui/material";

type LoadingModalProps = {
  open: boolean;
};

export default function LoadingModal({open}: LoadingModalProps) {
  return (
    <Modal open={open} aria-labelledby="loading-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          outline: "0",
        }}
      >
        <Typography
          id="loading-modal-title"
          sx={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: 0,
          }}
        >
          Loading
        </Typography>
        <CircularProgress />
      </Box>
    </Modal>
  );
}
