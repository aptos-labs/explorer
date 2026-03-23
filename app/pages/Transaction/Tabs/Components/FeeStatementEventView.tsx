import {Box, Paper, Table, Typography, useTheme} from "@mui/material";
import type React from "react";
import {APTCurrencyValue} from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../../components/IndividualPageContent/ContentValue/GasValue";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";

/** Module event type emitted with transaction fee breakdown (Aptos Framework). */
export const FEE_STATEMENT_EVENT_TYPE =
  "0x1::transaction_fee::FeeStatement" as const;

const KNOWN_FIELD_ORDER = [
  "execution_gas_units",
  "io_gas_units",
  "storage_fee_octas",
  "storage_fee_refund_octas",
  "total_charge_gas_units",
] as const;

type KnownField = (typeof KNOWN_FIELD_ORDER)[number];

const FIELD_LABELS: Record<KnownField, string> = {
  execution_gas_units: "Execution (compute)",
  io_gas_units: "I/O (storage access)",
  storage_fee_octas: "Storage fee",
  storage_fee_refund_octas: "Storage fee refund",
  total_charge_gas_units: "Total gas charged",
};

function isUIntString(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

function isFeeStatementShape(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }
  const record = data as Record<string, unknown>;
  return KNOWN_FIELD_ORDER.some((k) => k in record && isUIntString(record[k]));
}

function gasUnitsToOctas(gasUnits: string, gasUnitPrice: string): string {
  return (BigInt(gasUnits) * BigInt(gasUnitPrice)).toString();
}

type FeeRowProps = {
  label: string;
  children: React.ReactNode;
  description?: string;
};

function FeeRow({label, children, description}: FeeRowProps) {
  const theme = useTheme();
  return (
    <GeneralTableRow>
      <GeneralTableCell
        component="th"
        scope="row"
        sx={{
          verticalAlign: "top",
          fontWeight: 600,
          color: "text.primary",
          width: "38%",
        }}
      >
        {label}
        {description ? (
          <Typography
            component="div"
            variant="caption"
            sx={{
              display: "block",
              color: theme.palette.text.secondary,
              mt: 0.5,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </GeneralTableCell>
      <GeneralTableCell sx={{verticalAlign: "top"}}>
        {children}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function GasUnitsWithOptionalApt({
  gasUnits,
  gasUnitPrice,
}: {
  gasUnits: string;
  gasUnitPrice?: string;
}) {
  const theme = useTheme();
  const octas =
    gasUnitPrice !== undefined
      ? gasUnitsToOctas(gasUnits, gasUnitPrice)
      : undefined;
  return (
    <Box>
      <GasValue gas={gasUnits} />
      {octas !== undefined ? (
        <Typography
          component="span"
          variant="body2"
          sx={{display: "block", color: theme.palette.text.secondary, mt: 0.25}}
        >
          <APTCurrencyValue amount={octas} />
          <span> ({octas} octas)</span>
        </Typography>
      ) : null}
    </Box>
  );
}

function OctasRowValue({octas}: {octas: string}) {
  return (
    <Box>
      <APTCurrencyValue amount={octas} />
      <Typography
        component="span"
        variant="body2"
        sx={(theme) => ({color: theme.palette.text.secondary, ml: 0.5})}
      >
        ({octas} octas)
      </Typography>
    </Box>
  );
}

type FeeStatementEventViewProps = {
  data: Record<string, unknown>;
  /** When set (user transactions), gas rows also show an APT estimate at this price. */
  gasUnitPrice?: string;
};

/**
 * Human-readable breakdown of `0x1::transaction_fee::FeeStatement` module events.
 */
export default function FeeStatementEventView({
  data,
  gasUnitPrice,
}: FeeStatementEventViewProps) {
  const extraEntries = Object.entries(data).filter(
    ([key]) => !KNOWN_FIELD_ORDER.includes(key as KnownField),
  );

  return (
    <Paper variant="outlined" sx={{overflow: "hidden"}}>
      <Table size="small" sx={{tableLayout: "fixed"}}>
        <GeneralTableBody>
          {KNOWN_FIELD_ORDER.map((key) => {
            const raw = data[key];
            if (!isUIntString(raw)) {
              return null;
            }
            const label = FIELD_LABELS[key];
            if (
              key === "storage_fee_octas" ||
              key === "storage_fee_refund_octas"
            ) {
              return (
                <FeeRow
                  key={key}
                  label={label}
                  description={
                    key === "storage_fee_refund_octas"
                      ? "Credited when storage is released; not part of gas_used."
                      : "Charged for net new state; priced in octas."
                  }
                >
                  <OctasRowValue octas={raw} />
                </FeeRow>
              );
            }
            return (
              <FeeRow
                key={key}
                label={label}
                description={
                  key === "total_charge_gas_units"
                    ? "Sum of execution, I/O, and storage (as gas units). Matches gas_used on the transaction."
                    : undefined
                }
              >
                <GasUnitsWithOptionalApt
                  gasUnits={raw}
                  gasUnitPrice={gasUnitPrice}
                />
              </FeeRow>
            );
          })}
          {extraEntries.map(([key, value]) => (
            <FeeRow key={key} label={key}>
              <Typography
                component="pre"
                variant="body2"
                sx={{
                  m: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "monospace",
                }}
              >
                {typeof value === "string"
                  ? value
                  : JSON.stringify(value, null, 2)}
              </Typography>
            </FeeRow>
          ))}
        </GeneralTableBody>
      </Table>
    </Paper>
  );
}

export function shouldRenderFeeStatementTable(data: unknown): boolean {
  return isFeeStatementShape(data);
}
