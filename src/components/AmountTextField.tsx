import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import React from "react";

interface AmountTextFieldProps {
  amount: string;
  amountIsValid: boolean;
  errorMessage: string;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AmountTextField({
  amount,
  amountIsValid,
  errorMessage,
  onAmountChange,
}: AmountTextFieldProps): JSX.Element {
  return amountIsValid ? (
    <FormControl fullWidth>
      <FormHelperText sx={{fontSize: "1rem"}}>Enter Amount</FormHelperText>
      <OutlinedInput
        notched
        value={amount}
        onChange={onAmountChange}
        endAdornment={<InputAdornment position="end">APT</InputAdornment>}
      />
    </FormControl>
  ) : (
    <FormControl fullWidth>
      <FormHelperText sx={{fontSize: "1rem"}}>Enter Amount</FormHelperText>
      <OutlinedInput
        error
        notched
        value={amount}
        onChange={onAmountChange}
        endAdornment={<InputAdornment position="end">APT</InputAdornment>}
      />
      <FormHelperText error>{errorMessage}</FormHelperText>
    </FormControl>
  );
}
