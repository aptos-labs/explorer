import {useState, useEffect} from "react";
import AmountTextField from "../../../components/AmountTextField";
import React from "react";
import {MIN_ADD_STAKE_AMOUNT, OCTA} from "../../../constants";

interface StakingConfigData {
  minimum_stake: string;
  maximum_stake: string;
}

function isValidAmount(amount: string, minimumAmount: number): boolean {
  const amountNum = parseInt(amount);
  return amountNum >= minimumAmount;
}

const useAmountInput = () => {
  const [amount, setAmount] = useState<string>("");
  const [amountIsValid, setAmountIsValid] = useState<boolean>(true);

  useEffect(() => {
    setAmountIsValid(true);
  }, [amount]);

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value.replace(/[^0-9]/g, ""));
  };

  function clearAmount() {
    setAmount("");
  }

  function renderAmountTextField(): JSX.Element {
    return (
      <AmountTextField
        amount={amount}
        amountIsValid={amountIsValid}
        errorMessage={`Amount should be equal or above ${MIN_ADD_STAKE_AMOUNT}`}
        onAmountChange={onAmountChange}
      />
    );
  }

  function validateAmountInput(): boolean {
    const isValid = isValidAmount(amount, MIN_ADD_STAKE_AMOUNT);
    setAmountIsValid(isValid);
    return isValid;
  }

  return {amount, clearAmount, renderAmountTextField, validateAmountInput};
};

export default useAmountInput;
