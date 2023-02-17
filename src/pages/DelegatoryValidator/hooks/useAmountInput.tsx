import {useState, useEffect} from "react";
import AmountTextField from "../../../components/AmountTextField";
import React from "react";
import {MIN_ADD_STAKE_AMOUNT} from "../../../constants";
import {StakeOperation} from "../../../api/hooks/useSubmitStakeOperation";

function isValidAmount(
  amount: string,
  minimumAmount?: number,
  maximumAmount?: number,
): boolean {
  const amountNum = parseInt(amount);
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

  function renderAmountTextField(): JSX.Element {
    function getErrorMessage() {
      switch (stakeOperation) {
        case StakeOperation.STAKE:
          return `Minimum stake amount is ${MIN_ADD_STAKE_AMOUNT} APT`;
        case StakeOperation.UNLOCK:
          return "Amount should be equal or less your staked amount";
        case StakeOperation.REACTIVATE:
        case StakeOperation.WITHDRAW:
          return "Amount should be equal or less your unlocked amount";
      }
    }
    return (
      <AmountTextField
        amount={amount}
        amountIsValid={amountIsValid}
        errorMessage={getErrorMessage()}
        onAmountChange={onAmountChange}
      />
    );
  }

  function validateAmountInput(
    minAmount?: number,
    maxAmount?: number,
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
