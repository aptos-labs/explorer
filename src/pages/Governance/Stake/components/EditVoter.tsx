import React, {useEffect, useState} from "react";
import {
  Grid,
  Button,
  FormControl,
  Tooltip,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import TransactionResponseSnackbar from "../../components/snackbar/TransactionResponseSnackbar";
import LoadingModal from "../../components/LoadingModal";
import useAddressInput from "../../../../api/hooks/useAddressInput";
import useSubmitChangeVoterStake from "../../hooks/useSubmitChangeVoterStake";
import HashButton from "../../../../components/HashButton";

type EditVoterProps = {
  isWalletConnected: boolean;
  delegatedVoter: string;
};

export function EditVoter({
  isWalletConnected,
  delegatedVoter,
}: EditVoterProps): JSX.Element {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const [voterAddress, setVoterAddress] = useState<string>(delegatedVoter);

  const {
    addr: voterAddr,
    clearAddr: clearVoterAddr,
    renderAddressTextField: renderVoterAddressTextField,
    validateAddressInput: validateVoterAddressInput,
  } = useAddressInput();

  const {
    changeVoterStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitChangeVoterStake();

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      setVoterAddress(voterAddr);
      clearVoterAddr();
    }
  }, [transactionResponse]);

  const onSubmitClick = async () => {
    const isOperatorAddrValid = validateVoterAddressInput();
    if (isOperatorAddrValid) {
      await changeVoterStake(voterAddr);
    }
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  const submitDisabled = !isWalletConnected;
  const submitButton = (
    <span>
      <Button
        fullWidth
        variant="primary"
        disabled={submitDisabled}
        onClick={onSubmitClick}
      >
        Change Voter
      </Button>
    </span>
  );

  return (
    <>
      <TransactionResponseSnackbar
        transactionResponse={transactionResponse}
        onCloseSnackbar={onCloseSnackbar}
      />
      <LoadingModal open={transactionInProcess} />
      <Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack
              direction={isOnMobile ? "column" : "row"}
              spacing={1}
              alignItems={isOnMobile ? "flex-start" : "center"}
            >
              <Typography variant="subtitle1">
                Current Voter Address:
              </Typography>
              <HashButton hash={voterAddress} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            {renderVoterAddressTextField("New Voter Address")}
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              {submitDisabled ? (
                <Tooltip title="Please connect your wallet" arrow>
                  {submitButton}
                </Tooltip>
              ) : (
                submitButton
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
