import {
  Button,
  Stack,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Box,
} from "@mui/material";
import React, {useState, useEffect} from "react";
import useSubmitVote, {
  VoteResponseOnSuccess,
  VoteResponseOnFailure,
} from "../../hooks/useSubmitVote";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {
  primaryColor,
  negativeColor,
  primaryColorOnHover,
  negativeColorOnHover,
  voteFor,
  voteAgainst,
} from "../../constants";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ConfirmationModal from "./ConfirmationModal";

// TODO:
// 1. check if voted
// 2. check if eligible to vote

type Props = {
  proposalId: string;
};

export default function VoteButtons({proposalId}: Props) {
  const [accountAddr, setAccountAddr] = useState<string>("");
  const [voteForModalIsOpen, setVoteForModalIsOpen] = useState<boolean>(false);
  const [voteAgainstModalIsOpen, setVoteAgainstModalIsOpen] =
    useState<boolean>(false);

  const {submitVote, voteResponse, clearVoteResponse} =
    useSubmitVote(proposalId);

  useEffect(() => {
    if (voteResponse !== null) {
      closeVoteForModal();
      closeVoteAgainstModal();
    }
  }, [voteResponse]);

  const onAccountAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountAddr(event.target.value);
  };

  const openVoteForModal = () => {
    setVoteForModalIsOpen(true);
  };

  const closeVoteForModal = () => {
    setVoteForModalIsOpen(false);
  };

  const openVoteAgainstModal = () => {
    setVoteAgainstModalIsOpen(true);
  };

  const closeVoteAgainstModal = () => {
    setVoteAgainstModalIsOpen(false);
  };

  const onVote = (shouldPass: boolean) => {
    submitVote(shouldPass, accountAddr);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const onCloseErrorAlert = () => {
    clearVoteResponse();
  };

  const voteOnSuccessSnackbarAction = (
    <Box alignSelf="center" marginRight={1.5}>
      <Button
        variant="outlined"
        color="inherit"
        size="large"
        onClick={refreshPage}
        endIcon={<RefreshIcon />}
      >
        Refresh
      </Button>
    </Box>
  );

  const voteOnSuccessSnackbar = voteResponse !== null && (
    <Snackbar
      open={voteResponse.succeeded}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="success"
        action={voteOnSuccessSnackbarAction}
      >
        {`Vote succeeded with transaction ${
          (voteResponse as VoteResponseOnSuccess).transactionHash
        }. Please refresh to see your vote.`}
      </Alert>
    </Snackbar>
  );

  const voteOnFailureSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseErrorAlert}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  const voteOnFailureSnackbar = voteResponse !== null && (
    <Snackbar
      open={!voteResponse.succeeded}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="error"
        action={voteOnFailureSnackbarAction}
      >
        {`Vote failed with error message "${
          (voteResponse as VoteResponseOnFailure).message
        }". Please try again.`}
      </Alert>
    </Snackbar>
  );

  return (
    <>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Owner Account Address"
          variant="filled"
          size="small"
          margin="normal"
          value={accountAddr}
          onChange={onAccountAddrChange}
        />
        <Button
          fullWidth
          size="large"
          variant="primary"
          sx={{
            justifyContent: "start",
            backgroundColor: primaryColor,
            "&:hover": {
              backgroundColor: primaryColorOnHover,
            },
          }}
          startIcon={<CheckCircleOutlinedIcon />}
          onClick={openVoteForModal}
        >
          {voteFor}
        </Button>
        <Button
          fullWidth
          size="large"
          variant="primary"
          sx={{
            justifyContent: "start",
            backgroundColor: negativeColor,
            "&:hover": {
              backgroundColor: negativeColorOnHover,
            },
          }}
          startIcon={<CancelOutlinedIcon />}
          onClick={openVoteAgainstModal}
        >
          {voteAgainst}
        </Button>
      </Stack>
      {voteOnSuccessSnackbar}
      {voteOnFailureSnackbar}
      <ConfirmationModal
        open={voteForModalIsOpen}
        shouldPass={true}
        onConfirm={() => onVote(true)}
        onClose={closeVoteForModal}
      />
      <ConfirmationModal
        open={voteAgainstModalIsOpen}
        shouldPass={false}
        onConfirm={() => onVote(false)}
        onClose={closeVoteAgainstModal}
      />
    </>
  );
}
