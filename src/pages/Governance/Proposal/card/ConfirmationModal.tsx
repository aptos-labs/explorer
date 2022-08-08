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
import {
  voteFor,
  voteAgainst,
  primaryColor,
  negativeColor,
  primaryColorOnHover,
  negativeColorOnHover,
  primaryColorWithOpacity,
  negativeColorWithOpacity,
} from "../../constants";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

interface CardBoxProps {
  theme: Theme;
  children?: React.ReactNode;
}

const CardBox = ({theme, children}: CardBoxProps) => {
  return (
    <Box
      sx={{
        position: "absolute",
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
      {children}
    </Box>
  );
};

type ConfirmationModalProps = {
  open: boolean;
  shouldPass: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmationModal({
  open,
  shouldPass,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const theme = useTheme();

  const titleComponent = (
    <Stack
      direction="row"
      marginBottom={0.5}
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
  );

  const contentComponent = (
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
          <Typography variant="body1">You are voting</Typography>
          <Typography
            variant="body1"
            marginLeft={1}
            color={shouldPass ? primaryColor : negativeColor}
          >
            {shouldPass ? voteFor : voteAgainst}
          </Typography>
        </Stack>
        <Typography variant="body1">this proposal.</Typography>
      </Stack>
    </Stack>
  );

  const buttonsComponent = (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="space-evenly"
    >
      <Button
        variant="outlined"
        sx={{
          width: 150,
          color: shouldPass ? primaryColor : negativeColor,
          borderColor: shouldPass ? primaryColor : negativeColor,
          backgroundColor: "inherit",
          "&:hover": {
            borderColor: shouldPass ? primaryColor : negativeColor,
            backgroundColor: shouldPass
              ? primaryColorWithOpacity
              : negativeColorWithOpacity,
          },
        }}
        onClick={onClose}
      >
        CANCEL
      </Button>
      <Button
        variant="contained"
        sx={{
          width: 150,
          borderColor: shouldPass ? primaryColor : negativeColor,
          backgroundColor: shouldPass ? primaryColor : negativeColor,
          "&:hover": {
            backgroundColor: shouldPass
              ? primaryColorOnHover
              : negativeColorOnHover,
          },
        }}
        onClick={onConfirm}
      >
        CONFIRM
      </Button>
    </Stack>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <CardBox theme={theme}>
        {titleComponent}
        <Divider />
        {contentComponent}
        {buttonsComponent}
      </CardBox>
    </Modal>
  );
}
