import React from "react";
import {useTheme} from "@mui/material";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
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
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
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
          <span style={{color: theme.palette.text.secondary}}>
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
      color = semanticColors.status.info;
    } else if (netGasWithRefund > 0) {
      color = semanticColors.status.error;
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
        <span style={{color: theme.palette.text.secondary}}>
          {" ("}
          <GasValue gas={grossGasUnits.toString()} />
          {")"}
        </span>
      )}
    </>
  );
}
