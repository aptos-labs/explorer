import {
  FormControl,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
  Stack,
} from "@mui/material";
import type React from "react";
import {useTranslation} from "../i18n";
import {getFormattedBalanceStr} from "./IndividualPageContent/ContentValue/CurrencyValue";

interface AmountTextFieldProps {
  amount: string;
  warnMessage: string | undefined;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  balance?: string | null;
}

export default function AmountTextField({
  amount,
  warnMessage,
  onAmountChange,
  balance,
}: AmountTextFieldProps) {
  const {t} = useTranslation();
  return (
    <FormControl fullWidth>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
        }}
      >
        <FormHelperText sx={{fontSize: "1rem"}}>
          {t("staking.enterAmount")}
        </FormHelperText>
      </Stack>
      <OutlinedInput
        notched
        value={amount}
        onChange={onAmountChange}
        // Mobile keyboards default to letters without an explicit numeric hint
        inputProps={{inputMode: "decimal", pattern: "[0-9]*[.]?[0-9]*"}}
        endAdornment={<InputAdornment position="end">APT</InputAdornment>}
        placeholder={
          balance
            ? t("staking.balancePlaceholder", {
                balance: getFormattedBalanceStr(balance, undefined, 1),
              })
            : ""
        }
      />
      {warnMessage && <FormHelperText>{warnMessage}</FormHelperText>}
    </FormControl>
  );
}
