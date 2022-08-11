import {Button, Stack, Snackbar, Alert, IconButton, Box} from "@mui/material";
import React, {useState, useEffect} from "react";
import useSubmitVote from "../../hooks/useSubmitVote";
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
import {
  TransactionResponseOnFailure,
  TransactionResponseOnSuccess,
} from "../../../../api/hooks/useSubmitTransaction";
import useAddressInput from "../../../../api/hooks/useAddressInput";

// TODO:
// 1. check if voted
// 2. check if eligible to vote

type VoteButtonsProps = {
  proposalId: string;
};

export default function VoteButtons({proposalId}: VoteButtonsProps) {
  const [voteForModalIsOpen, setVoteForModalIsOpen] = useState<boolean>(false);
  const [voteAgainstModalIsOpen, setVoteAgainstModalIsOpen] =
    useState<boolean>(false);

  const {
    addr: accountAddr,
    renderAddressTextField,
    validateAddressInput,
  } = useAddressInput();

  const {submitVote, transactionResponse, clearTransactionResponse} =
    useSubmitVote();

  useEffect(() => {
    if (transactionResponse !== null) {
      closeVoteForModal();
      closeVoteAgainstModal();
    }
  }, [transactionResponse]);

  const openModal = (shouldPass: boolean) => {
    const isValid = validateAddressInput();
    if (isValid) {
      if (shouldPass) {
        setVoteForModalIsOpen(true);
      } else {
        setVoteAgainstModalIsOpen(true);
      }
    }
  };

  const closeVoteForModal = () => {
    setVoteForModalIsOpen(false);
  };

  const closeVoteAgainstModal = () => {
    setVoteAgainstModalIsOpen(false);
  };

  const onVote = (shouldPass: boolean) => {
    submitVote(parseInt(proposalId), shouldPass, accountAddr);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const onCloseErrorAlert = () => {
    clearTransactionResponse();
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

  const voteOnSuccessSnackbar = transactionResponse !== null && (
    <Snackbar
      open={transactionResponse.succeeded}
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
          (transactionResponse as TransactionResponseOnSuccess).transactionHash
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

  const voteOnFailureSnackbar = transactionResponse !== null && (
    <Snackbar
      open={!transactionResponse.succeeded}
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
          (transactionResponse as TransactionResponseOnFailure).message
        }". Please try again.`}
      </Alert>
    </Snackbar>
  );

  return (
    <>
      <Stack spacing={2}>
        {renderAddressTextField("Owner Account Address")}
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
          onClick={() => openModal(true)}
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
          onClick={() => openModal(false)}
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
