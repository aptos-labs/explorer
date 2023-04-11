import {useState} from "react";
import AmountTextField from "../../../components/AmountTextField";
import React from "react";
import {StakeOperation} from "../../../api/hooks/useSubmitStakeOperation";
import {MINIMUM_APT_IN_POOL} from "../constants";
import {OCTA} from "../../../constants";
import {Types} from "aptos";

function sanitizeInput(input: string): string {
  const digitsAndDecimals = /[0-9.]/g;
  const multipleDecimals = /\.(?=.*\.)/g;

  const sanitizedInput = input.match(digitsAndDecimals)?.join("");
  return sanitizedInput?.replace(multipleDecimals, "") ?? "";
}

function isValidAmount(
  amount: string,
  minimumAmount: number | null,
  maximumAmount: number | null,
): boolean {
  const amountNum = parseFloat(amount);
  if (minimumAmount && maximumAmount) {
    return amountNum >= minimumAmount && amountNum <= maximumAmount;
  } else if (minimumAmount) {
    return amountNum >= minimumAmount;
  } else if (maximumAmount) {
    return amountNum <= maximumAmount;
  }
  // if no min or max constraint, amount is always valid
  return true;
}

const useAmountInput = (stakeOperation: StakeOperation) => {
  const [amount, setAmount] = useState<string>("");

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = sanitizeInput(event.target.value);
    setAmount(sanitizedInput);
  };

  function clearAmount() {
    setAmount("");
  }

  function renderAmountTextField(
    stakes: Types.MoveValue[],
    balance?: string | null,
  ): JSX.Element {
    function getWarnMessage() {
      const stakedAmount = Number(stakes[0]) / OCTA;
      const unlockedAmount = Number(stakes[2]) / OCTA;

      switch (stakeOperation) {
        case StakeOperation.UNLOCK:
          if (
            amount &&
            (stakedAmount - Number(amount) < MINIMUM_APT_IN_POOL ||
              unlockedAmount + Number(amount) < MINIMUM_APT_IN_POOL) &&
            amount !== stakedAmount.toString()
          ) {
            return `If you unlock ${amount} APT, your total staked amount ${stakedAmount} APT will be unlocked.`;
          }
          break;
        case StakeOperation.REACTIVATE:
          if (
            amount &&
            (unlockedAmount - Number(amount) < MINIMUM_APT_IN_POOL ||
              stakedAmount + Number(amount) < MINIMUM_APT_IN_POOL) &&
            amount !== unlockedAmount.toString()
          ) {
            return `If you restake ${amount} APT, your total unlocked amount ${unlockedAmount} APT will be restaked.`;
          }
          break;
        case StakeOperation.STAKE:
          if (stakedAmount === 0) {
            return "Minimum stake amount is 11 APT.";
          }
      }
    }

    return (
      <AmountTextField
        amount={amount}
        warnMessage={getWarnMessage()}
        onAmountChange={onAmountChange}
        balance={balance}
      />
    );
  }

  function validateAmountInput(
    minAmount: number | null,
    maxAmount: number | null,
  ): boolean {
    const isValid = isValidAmount(amount, minAmount, maxAmount);
    return isValid;
  }

  return {
    amount,
    setAmount,
    clearAmount,
    renderAmountTextField,
    validateAmountInput,
  };
};

export default useAmountInput;
