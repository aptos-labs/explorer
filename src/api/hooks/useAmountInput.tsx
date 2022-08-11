import React, {useState, useEffect} from "react";
import AmountTextField from "../../components/AmountTextField";

// TODO - this will likely be very dependent per network
// pull from on chain config 0x1::stake::ValidatorSetConfiguration
function isValidAmount(amount: string): boolean {
  const amountNum = parseInt(amount);
  return amountNum > 0;
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

  function renderAmountTextField(label: string) {
    return (
      <AmountTextField
        label={label}
        amount={amount}
        amountIsValid={amountIsValid}
        onAmountChange={onAmountChange}
      />
    );
  }

  function validateAmountInput(): boolean {
    const isValid = isValidAmount(amount);
    setAmountIsValid(isValid);
    return isValid;
  }

  return {amount, clearAmount, renderAmountTextField, validateAmountInput};
};

export default useAmountInput;
