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
  const grossGasUnits = BigInt(gasUsed);
  const netGasWithoutRefund = BigInt(gasUnitPrice) * grossGasUnits;

  const feeStatement = transactionData.events?.find(
    (e) => e.type === "0x1::transaction_fee::FeeStatement",
  );
  if (!feeStatement) {
    return (
      <>
        <APTCurrencyValue amount={netGasWithoutRefund.toString()} />
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

  const feeStatementGasUnits = BigInt(feeStatement.data.total_charge_gas_units);
  const feeStatementGasUnitsCost = feeStatementGasUnits * BigInt(gasUnitPrice);
  const storageRefundOctas = BigInt(feeStatement.data.storage_fee_refund_octas);

  const netGasWithRefund = feeStatementGasUnitsCost - storageRefundOctas;

  if (storageRefund) {
    return (
      <>
        <APTCurrencyValue amount={storageRefundOctas.toString()} />
      </>
    );
  }

  if (netGasCost) {
    return (
      <>
        {netGasWithRefund < 0 ? "-" : ""}
        <APTCurrencyValue amount={netGasWithRefund.toString()} />
      </>
    );
  }

  return (
    <>
      <APTCurrencyValue amount={netGasWithoutRefund.toString()} />
      {showGasUsed === true && (
        <span style={{color: grey[450]}}>
          {" ("}
          <GasValue gas={grossGasUnits.toString()} />
          {")"}
        </span>
      )}
    </>
  );
}
