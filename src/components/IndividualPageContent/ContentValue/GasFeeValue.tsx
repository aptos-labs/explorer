import React from "react";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {APTCurrencyValue, APTCurrencyValueNoSymbol} from "./CurrencyValue";
import GasValue from "./GasValue";

type GasFeeValueProps = {
  gasUsed: string;
  gasUnitPrice: string;
  showGasUsed?: boolean;
  hideSymbol?: boolean;
};

export default function GasFeeValue({
  gasUsed,
  gasUnitPrice,
  showGasUsed,
  hideSymbol,
}: GasFeeValueProps) {
  return (
    <>
      {hideSymbol ? (
        <APTCurrencyValueNoSymbol
          amount={(BigInt(gasUnitPrice) * BigInt(gasUsed)).toString()}
        />
      ) : (
        <APTCurrencyValue
          amount={(BigInt(gasUnitPrice) * BigInt(gasUsed)).toString()}
        />
      )}
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
