import React from "react";
import {
  libra2Color,
  grey,
  negativeColor,
} from "../../../themes/colors/libra2ColorPalette";
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
    let amountAbs = netGasWithRefund;
    let color = undefined;
    if (netGasWithRefund < 0) {
      color = libra2Color;
    } else if (netGasWithRefund > 0) {
      color = negativeColor;
      amountAbs = -netGasWithRefund;
    }
    return (
      <span style={{color: color}}>
        {netGasWithRefund < 0 && <>+</>}
        {netGasWithRefund > 0 && <>-</>}
        <APTCurrencyValue amount={amountAbs.toString()} />
      </span>
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
