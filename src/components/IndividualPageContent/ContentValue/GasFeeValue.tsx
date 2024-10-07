import React from "react";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {APTCurrencyValue} from "./CurrencyValue";
import GasValue from "./GasValue";
import {Types} from "aptos";

type GasFeeValueProps = {
  gasUsed: string;
  gasUnitPrice: string;
  showGasUsed?: boolean;
  transactionData: Types.Transaction_UserTransaction;
  netGasCost?: boolean;
  storageRefund?: boolean;
};

export default function GasFeeValue({
  gasUsed,
  gasUnitPrice,
  showGasUsed,
  transactionData,
  netGasCost = false,
  storageRefund = false,
}: GasFeeValueProps) {
  function getGasFee() {
    const feeStatement = transactionData.events?.find(
      (e) => e.type === "0x1::transaction_fee::FeeStatement",
    );
    if (!feeStatement) {
      return simpleGasFee();
    }

    const execution_gas = feeStatement.data.execution_gas_units;
    const io_gas = feeStatement.data.io_gas_units;
    const storage_gas = feeStatement.data.storage_fee_octas;
    const storage_refund = feeStatement.data.storage_fee_refund_octas;

    const gross_gas_units =
      BigInt(execution_gas) + BigInt(io_gas) + BigInt(storage_gas);
    const gross_gas_cost = gross_gas_units * BigInt(gasUnitPrice);
    const net_gas_cost = gross_gas_cost - BigInt(storage_refund);

    if (storageRefund) {
      return (
        <>
          <APTCurrencyValue amount={storage_refund.toString()} />
        </>
      );
    }

    if (netGasCost) {
      return (
        <>
          {net_gas_cost < 0 ? "-" : ""}
          <APTCurrencyValue amount={net_gas_cost.toString()} />
        </>
      );
    }

    return (
      <>
        <APTCurrencyValue amount={gross_gas_cost.toString()} />
        {showGasUsed === true && (
          <span style={{color: grey[450]}}>
            {" ("}
            <GasValue gas={gross_gas_units.toString()} />
            {")"}
          </span>
        )}
      </>
    );
  }

  function simpleGasFee() {
    return (
      <>
        <APTCurrencyValue
          amount={(BigInt(gasUnitPrice) * BigInt(gasUsed)).toString()}
        />
        {showGasUsed === true && (
          <span style={{color: grey[450]}}>
            {" ("}
            <GasValue gas={gasUsed} />
            {")"}
          </span>
        )}
      </>
    );
  }

  return getGasFee();
}
