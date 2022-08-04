import {
  Button,
  Stack,
  TextField,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import React, {useState} from "react";
import useSubmitVote from "../../SubmitVote";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {negativeColor, voteFor, voteAgainst} from "../../constants";
import CloseIcon from "@mui/icons-material/Close";

// TODO:
// 1. check if voted
// 2. check if eligible to vote

// TODO: revisit the messages below
const SUCCESS_MESSAGE = "Vote succeeded. Please refresh to see your vote.";
const ERROR_MESSAGE = "Vote failed. Please try again.";

type Props = {
  proposalId: string;
};

export default function VoteButtons({proposalId}: Props) {
  const [accountAddr, setAccountAddr] = useState<string>("");
  const {submitVote, voteSucceeded, resetVoteSucceeded} =
    useSubmitVote(proposalId);

  const onAccountAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountAddr(event.target.value);
  };

  const onVote = (shouldPass: boolean) => {
    submitVote(shouldPass, accountAddr);
  };

  const onRefreshPage = () => {
    window.location.reload();
  };

  const onCloseErrorAlert = () => {
    resetVoteSucceeded();
  };

  const action = (
    <Button variant="outlined" size="large" onClick={onRefreshPage}>
      REFRESH
    </Button>
  );

  const successAlertComponent = (
    <Alert
      variant="filled"
      severity="success"
      action={
        <Button variant="outlined" size="small" onClick={onRefreshPage}>
          REFRESH
        </Button>
      }
    >
      {SUCCESS_MESSAGE}
    </Alert>
  );

  const errorAlertComponent = (
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
      {ERROR_MESSAGE}
    </Alert>
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
      <Snackbar
        open={voteSucceeded === true}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {successAlertComponent}
      </Snackbar>
      <Snackbar
        open={voteSucceeded === false}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {errorAlertComponent}
      </Snackbar>
    </>
  );
}
