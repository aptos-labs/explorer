import React, {useState, useEffect} from "react";
import AmountTextField from "../../../components/AmountTextField";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";

interface StakingConfigData {
  minimum_stake: string;
  maximum_stake: string;
}

function isValidAmount(
  amount: string,
  minimumAmount: number,
  maximumAmount: number,
): boolean {
  const amountNum = parseInt(amount);
  return amountNum <= maximumAmount && amountNum >= minimumAmount;
}

const useAmountInput = () => {
  const [amount, setAmount] = useState<string>("");
  const [amountIsValid, setAmountIsValid] = useState<boolean>(true);
  const [minimumAmount, setMinimumAmount] = useState<number>(0);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);

  const accountResourcesResult = useGetAccountResources("0x1");

  const stakingConfig = accountResourcesResult.data?.find(
    (resource) => resource.type === "0x1::staking_config::StakingConfig",
  );

  useEffect(() => {
    if (!stakingConfig) return;
    const {maximum_stake, minimum_stake} =
      stakingConfig.data as StakingConfigData;
    setMinimumAmount(parseInt(minimum_stake));
    setMaximumAmount(parseInt(maximum_stake));
  }, [stakingConfig]);

  useEffect(() => {
    setAmountIsValid(true);
  }, [amount]);

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value.replace(/[^0-9]/g, ""));
  };

  function clearAmount() {
    setAmount("");
  }

  function renderAmountTextField(label: string): JSX.Element {
    return (
      <AmountTextField
        label={label}
        amount={amount}
        amountIsValid={amountIsValid}
        errorMessage={`Amount should be between ${minimumAmount} and ${maximumAmount}`}
        onAmountChange={onAmountChange}
      />
    );
  }

  function validateAmountInput(): boolean {
    const isValid = isValidAmount(amount, minimumAmount, maximumAmount);
    setAmountIsValid(isValid);
    return isValid;
  }

  return {amount, clearAmount, renderAmountTextField, validateAmountInput};
};

export default useAmountInput;
