import React, {useState} from "react";
import {
  Grid,
  TextField,
  Button,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
} from "@mui/material";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {Header} from "../Header";

export function StakePage() {
  const [stakingEndTime, setStakingEndTime] = useState<Date | null>(new Date());
  const [stakingAmount, setStakingAmount] = useState<string>("");
  const [operatorAddr, setOperatorAddr] = useState<string>("");
  const [voterAddr, setVoterAddr] = useState<string>("");

  const onStakingEndTimeChange = (newStakingEndTime: Date | null) => {
    setStakingEndTime(newStakingEndTime);
  };

  const onStakingAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStakingAmount(event.target.value);
  };

  const onOperatorAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorAddr(event.target.value);
  };

  const onVoterAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoterAddr(event.target.value);
  };

  const onSubmitClick = async () => {
    // TODO: to be implemented
    console.log("Submit Staking");
  };

  return (
    <Grid>
      <Header />
      <Grid container spacing={2}>
        <Grid item xs={6} md={6}>
          <FormControl fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">
              Staking Amount
            </InputLabel>
            <OutlinedInput
              label="Staking Amount"
              value={stakingAmount}
              onChange={onStakingAmountChange}
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={6} md={6}>
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Staking End Time"
                value={stakingEndTime}
                onChange={onStakingEndTimeChange}
                renderInput={(params) => <TextField {...params} />}
                minTime={new Date()}
              />
            </LocalizationProvider>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12}>
          <TextField
            fullWidth
            label="Operator Address"
            variant="outlined"
            value={operatorAddr}
            onChange={onOperatorAddrChange}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <TextField
            fullWidth
            label="Voter Address"
            variant="outlined"
            value={voterAddr}
            onChange={onVoterAddrChange}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <FormControl fullWidth>
            <Button variant="primary" onClick={onSubmitClick}>
              Submit
            </Button>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
}
