import {useState, useEffect} from "react";
import AmountTextField from "../../../components/AmountTextField";
import React from "react";
import {StakeOperation} from "../../../api/hooks/useSubmitStakeOperation";
import {APTRequirement} from "../utils";
import {MINIMUM_APT_IN_POOL_FOR_EXPLORER} from "../constants";
import {OCTA} from "../../../constants";
import {Types} from "aptos";

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
  const [amountIsValid, setAmountIsValid] = useState<boolean>(true);

  useEffect(() => {
    setAmountIsValid(true);
  }, [amount]);

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value.replace(/[^0-9.]/g, ""));
  };

  function clearAmount() {
    setAmount("");
  }

  function renderAmountTextField(
    requirement: APTRequirement,
    stakes: Types.MoveValue[],
    balance?: string | null,
  ): JSX.Element {
    function getWarnMessage() {
      switch (stakeOperation) {
        case StakeOperation.UNLOCK:
          const staked = Number(stakes[0]) / OCTA;
          if (
            amount &&
            staked - Number(amount) < MINIMUM_APT_IN_POOL_FOR_EXPLORER
          ) {
            return `If you decide to unlock ${amount} APT, your total staked amount ${staked} APT will be unlocked.`;
          }
          break;
        case StakeOperation.REACTIVATE:
          const unlocked = Number(stakes[2]) / OCTA;
          if (
            amount &&
            unlocked - Number(amount) < MINIMUM_APT_IN_POOL_FOR_EXPLORER
          ) {
            return `If you decide to restake ${amount} APT, your total unlocked amount ${unlocked} APT will be restaked.`;
          }
          break;
      }
    }

    function getErrorMessage() {
      switch (stakeOperation) {
        case StakeOperation.STAKE:
          return `Minimum stake amount is ${requirement.min} APT and maximum stake amount is ${balance} APT`;
        case StakeOperation.UNLOCK:
          return `Minimum unlock amount is ${requirement.min} APT and maximum unlock amount is ${requirement.max} APT`;
        case StakeOperation.REACTIVATE:
          return `Minimum restake amount is ${requirement.min} APT and maximum restake amount is ${requirement.max} APT`;
        case StakeOperation.WITHDRAW:
          return "Amount should be equal or less your successfully unlocked amount";
      }
    }
    return (
      <AmountTextField
        amount={amount}
        amountIsValid={amountIsValid}
        errorMessage={getErrorMessage()}
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
    setAmountIsValid(isValid);
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
