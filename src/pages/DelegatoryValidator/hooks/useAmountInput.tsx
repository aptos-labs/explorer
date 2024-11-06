import React, {useState} from "react";
import AmountTextField from "../../../components/AmountTextField";
import {StakeOperation} from "../../../api/hooks/useSubmitStakeOperation";
import {MINIMUM_APT_IN_POOL} from "../constants";
import {OCTA} from "../../../constants";
import {MoveValue} from "@aptos-labs/ts-sdk";

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

  function renderAmountTextField(
    stakes: MoveValue[],
    balance?: string | null,
  ): JSX.Element {
    function getWarnMessage() {
      const stakedAmount = Number(stakes[0]) / OCTA;
      const unlockedAmount = Number(stakes[2]) / OCTA;

      switch (stakeOperation) {
        case StakeOperation.UNLOCK:
          /**
           * if active pool has less than 10 apt after txn, unlock all
           * if pending_inactive pool has less than 10 apt after txn
           * if active pool has enough stake, unlock 10 apt to meet minimum requirement
           * else unlock all
           */
          if (
            amount &&
            stakedAmount - Number(amount) < MINIMUM_APT_IN_POOL &&
            amount !== stakedAmount.toString()
          ) {
            return `If you unlock ${amount} APT, your total staked amount ${stakedAmount} APT will be unlocked.`;
          } else if (
            amount &&
            unlockedAmount + Number(amount) < MINIMUM_APT_IN_POOL &&
            amount !== stakedAmount.toString()
          ) {
            if (stakedAmount - MINIMUM_APT_IN_POOL > MINIMUM_APT_IN_POOL) {
              return `If you unlock ${amount} APT, ${MINIMUM_APT_IN_POOL} APT will be unlocked.`;
            } else {
              return `If you unlock ${amount} APT, your total staked amount ${stakedAmount} APT will be unlocked.`;
            }
          }
          break;
        case StakeOperation.REACTIVATE:
          /**
           * if pending_inactive pool has less than 10 apt after txn, reactivate all
           * if active pool has less than 10 apt after txn, reactivate 10 apt to meet minimum requirement
           * if pending_inactive pool has enough stake, ractivate 10 apt to meet minimum requirement
           * else reactivate all
           */
          if (
            amount &&
            unlockedAmount - Number(amount) < MINIMUM_APT_IN_POOL &&
            stakedAmount + Number(amount) < MINIMUM_APT_IN_POOL &&
            amount !== unlockedAmount.toString()
          ) {
            return `If you restake ${amount} APT, your total unlocked amount ${unlockedAmount} APT will be restaked.`;
          } else if (
            amount &&
            unlockedAmount - Number(amount) < MINIMUM_APT_IN_POOL &&
            amount !== unlockedAmount.toString()
          ) {
            return `If you restake ${amount} APT, your total unlocked amount ${unlockedAmount} APT will be restaked.`;
          } else if (
            amount &&
            stakedAmount + Number(amount) < MINIMUM_APT_IN_POOL &&
            amount !== unlockedAmount.toString()
          ) {
            if (unlockedAmount - MINIMUM_APT_IN_POOL > MINIMUM_APT_IN_POOL) {
              return `If you restake ${amount} APT, ${MINIMUM_APT_IN_POOL} APT will be restaked.`;
            } else {
              return `If you restake ${amount} APT, your total unlocked amount ${unlockedAmount} APT will be restaked.`;
            }
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
    return isValidAmount(amount, minAmount, maxAmount);
  }

  return {
    amount,
    setAmount,
    renderAmountTextField,
    validateAmountInput,
  };
};

export default useAmountInput;
