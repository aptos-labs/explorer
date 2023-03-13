import {Stack} from "@mui/material";
import {
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import React from "react";
import {getFormattedBalanceStr} from "./IndividualPageContent/ContentValue/CurrencyValue";

interface AmountTextFieldProps {
  amount: string;
  amountIsValid: boolean;
  errorMessage: string;
  warnMessage: string | undefined;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  balance?: string | null;
}

export default function AmountTextField({
  amount,
  amountIsValid,
  errorMessage,
  warnMessage,
  onAmountChange,
  balance,
}: AmountTextFieldProps): JSX.Element {
  return amountIsValid ? (
    <FormControl fullWidth>
      <Stack direction="row" justifyContent="space-between">
        <FormHelperText sx={{fontSize: "1rem"}}>Enter Amount</FormHelperText>
      </Stack>
      <OutlinedInput
        notched
        value={amount}
        onChange={onAmountChange}
        endAdornment={<InputAdornment position="end">APT</InputAdornment>}
        placeholder={
          balance
            ? `Your balance: ${getFormattedBalanceStr(balance, undefined, 1)}`
            : ""
        }
      />
      {warnMessage && <FormHelperText>{warnMessage}</FormHelperText>}
    </FormControl>
  ) : (
    <FormControl fullWidth>
      <Stack direction="row" justifyContent="space-between">
        <FormHelperText sx={{fontSize: "1rem"}}>Enter Amount</FormHelperText>
      </Stack>
      <OutlinedInput
        error
        notched
        value={amount}
        onChange={onAmountChange}
        endAdornment={<InputAdornment position="end">APT</InputAdornment>}
        placeholder={
          balance
            ? `Your balance: ${getFormattedBalanceStr(balance, undefined, 1)}`
            : ""
        }
      />
      <FormHelperText error>{errorMessage}</FormHelperText>
    </FormControl>
  );
}
