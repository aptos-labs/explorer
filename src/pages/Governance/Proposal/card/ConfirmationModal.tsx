import React from "react";
import {
  Typography,
  Modal,
  Box,
  Divider,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {useTheme} from "@mui/material/styles";
import {Theme} from "@mui/material/styles";
import {primaryColor, negativeColor} from "../../constants";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

type ContentTextProps = {
  shouldPass: boolean;
};

const Content = ({shouldPass}: ContentTextProps) => {
  return (
    <Stack
      direction="row"
      marginX={2}
      marginY={6}
      spacing={1.5}
      alignItems="center"
    >
      {shouldPass ? (
        <CheckCircleOutlinedIcon fontSize="large" sx={{color: primaryColor}} />
      ) : (
        <CancelOutlinedIcon fontSize="large" sx={{color: negativeColor}} />
      )}
      <Stack direction="column">
        <Stack direction="row">
          <Typography variant="body1">{`You are voting`}</Typography>
          <Typography
            variant="body1"
            marginLeft={1}
            color={shouldPass ? primaryColor : negativeColor}
          >
            {shouldPass ? `FOR` : `Against`}
          </Typography>
        </Stack>
        <Typography variant="body1">{`this proposal.`}</Typography>
      </Stack>
    </Stack>
  );
};

type CardBoxProps = {
  shouldPass: boolean;
  theme: Theme;
  onClose: () => void;
};

const CardBox = ({shouldPass, theme, onClose}: CardBoxProps) => {
  return (
    <Box
      sx={{
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 350,
        backgroundColor: `${
          theme.palette.mode === "dark" ? grey[700] : grey[100]
        }`,
        p: 3,
        borderRadius: 1,
      }}
    >
      <Stack
        direction="row"
        marginBottom={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="subtitle1" marginLeft={1}>
          Are you sure?
        </Typography>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={onClose}
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider />
      <Content shouldPass={shouldPass} />
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-evenly"
      >
        <Button variant="outlined" sx={{width: 150}}>
          CANCEL
        </Button>
        <Button variant="contained" sx={{width: 150}}>
          CONFIRM
        </Button>
      </Stack>
    </Box>
  );
};

type ConfirmationModalProps = {
  open: boolean;
  shouldPass: boolean | null;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmationModal({
  open,
  shouldPass,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (shouldPass === null) {
    return null;
  }

  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <CardBox shouldPass={false} theme={theme} onClose={onClose} />
    </Modal>
  );
}
