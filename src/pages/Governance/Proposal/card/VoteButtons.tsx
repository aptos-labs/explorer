import {Button, Stack, TextField} from "@mui/material";
import React, {useState} from "react";
import useSubmitVote from "../../SubmitVote";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {negativeColor, voteFor, voteAgainst} from "../../constants";

// TODO:
// 1. check if voted
// 2. check if eligible to vote

type Props = {
  proposalId: string;
};

export default function VoteButtons({proposalId}: Props) {
  const [accountAddr, setAccountAddr] = useState<string>("");
  const [submitVote] = useSubmitVote(proposalId);

  const onAccountAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountAddr(event.target.value);
  };

  const onVote = (shouldPass: boolean) => {
    submitVote(shouldPass);
  };

  return (
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
  );
}
