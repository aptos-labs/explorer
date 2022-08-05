import {
  Button,
  Stack,
  TextField,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import React, {useState} from "react";
import useSubmitVote, {
  VoteResponseOnSuccess,
  VoteResponseOnFailure,
} from "../../hooks/useSubmitVote";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {negativeColor, voteFor, voteAgainst} from "../../constants";
import CloseIcon from "@mui/icons-material/Close";

// TODO:
// 1. check if voted
// 2. check if eligible to vote

type Props = {
  proposalId: string;
};

export default function VoteButtons({proposalId}: Props) {
  const [accountAddr, setAccountAddr] = useState<string>("");
  const {submitVote, voteResponse, clearVoteResponse} =
    useSubmitVote(proposalId);

  const onAccountAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountAddr(event.target.value);
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
        action={
          <Button variant="outlined" size="small" onClick={refreshPage}>
            REFRESH
          </Button>
        }
      >
        {`Vote succeeded with transaction ${
          (voteResponse as VoteResponseOnSuccess).transactionHash
        }. Please refresh to see your vote.`}
      </Alert>
    </Snackbar>
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
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onCloseErrorAlert}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
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
          sx={{justifyContent: "start"}}
          startIcon={<CheckCircleOutlinedIcon />}
          onClick={() => onVote(true)}
        >
          {voteFor}
        </Button>
        <Button
          fullWidth
          size="large"
          variant="primary"
          sx={{justifyContent: "start", backgroundColor: negativeColor}}
          startIcon={<CancelOutlinedIcon />}
          onClick={() => onVote(false)}
        >
          {voteAgainst}
        </Button>
      </Stack>
      {voteOnSuccessSnackbar}
      {voteOnFailureSnackbar}
    </>
  );
}
