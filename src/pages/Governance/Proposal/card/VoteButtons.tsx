import {Button, Stack} from "@mui/material";
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
import ConfirmationModal from "./ConfirmationModal";
import TransactionResponseSnackbar from "../../components/snackbar/TransactionResponseSnackbar";
import useAddressInput from "../../../../api/hooks/useAddressInput";
import LoadingModal from "../../components/LoadingModal";

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

  const {
    submitVote,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitVote();

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
    submitVote(proposalId, shouldPass, accountAddr);
    closeVoteForModal();
    closeVoteAgainstModal();
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

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
      <TransactionResponseSnackbar
        transactionResponse={transactionResponse}
        onCloseSnackbar={onCloseSnackbar}
        refreshOnSuccess={true}
      />
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
      <LoadingModal open={transactionInProcess} />
    </>
  );
}
