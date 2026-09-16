import {Box, Paper, Typography, useTheme} from "@mui/material";
import {APTCurrencyValue} from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../../components/IndividualPageContent/ContentValue/GasValue";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../../../../components/Table/ResponsiveKeyValueTable";
import {useTranslation} from "../../../../i18n";

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

const FIELD_LABEL_KEYS: Record<KnownField, string> = {
  execution_gas_units: "payments.fee.execution",
  io_gas_units: "payments.fee.io",
  storage_fee_octas: "payments.fee.storage",
  storage_fee_refund_octas: "payments.fee.storageRefund",
  total_charge_gas_units: "payments.fee.total",
};

function isUIntString(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

function isFeeStatementShape(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }
  const record = data as Record<string, unknown>;
  if (!isUIntString(record.total_charge_gas_units)) {
    return false;
  }
  return KNOWN_FIELD_ORDER.every(
    (key) => !(key in record) || isUIntString(record[key]),
  );
}

function gasUnitsToOctas(gasUnits: string, gasUnitPrice: string): string {
  return (BigInt(gasUnits) * BigInt(gasUnitPrice)).toString();
}

function GasUnitsWithOptionalApt({
  gasUnits,
  gasUnitPrice,
}: {
  gasUnits: string;
  gasUnitPrice?: string;
}) {
  const {t} = useTranslation();
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
          <APTCurrencyValue amount={octas} />{" "}
          <span>{t("common.octasParens", {amount: octas})}</span>
        </Typography>
      ) : null}
    </Box>
  );
}

function OctasRowValue({octas}: {octas: string}) {
  const {t} = useTranslation();
  return (
    <Box>
      <APTCurrencyValue amount={octas} />
      <Typography
        component="span"
        variant="body2"
        sx={(theme) => ({color: theme.palette.text.secondary, ml: 0.5})}
      >
        {t("common.octasParens", {amount: octas})}
      </Typography>
    </Box>
  );
}

const extraValueTypography = {
  m: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "monospace",
} as const;

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
  const {t} = useTranslation();
  const extraEntries = Object.entries(data).filter(
    ([key]) => !KNOWN_FIELD_ORDER.includes(key as KnownField),
  );

  const knownNodes = KNOWN_FIELD_ORDER.map((key) => {
    const raw = data[key];
    if (!isUIntString(raw)) {
      return null;
    }
    const label = t(FIELD_LABEL_KEYS[key]);
    if (key === "storage_fee_octas" || key === "storage_fee_refund_octas") {
      const description =
        key === "storage_fee_refund_octas"
          ? t("payments.fee.storageRefundShortTip")
          : t("payments.fee.storageShortTip");
      return (
        <ResponsiveKeyValueRow
          key={key}
          label={label}
          description={description}
        >
          <OctasRowValue octas={raw} />
        </ResponsiveKeyValueRow>
      );
    }
    const description =
      key === "total_charge_gas_units" ? t("payments.fee.totalTip") : undefined;
    return (
      <ResponsiveKeyValueRow key={key} label={label} description={description}>
        <GasUnitsWithOptionalApt gasUnits={raw} gasUnitPrice={gasUnitPrice} />
      </ResponsiveKeyValueRow>
    );
  });

  const extraNodes = extraEntries.map(([key, value]) => (
    <ResponsiveKeyValueRow key={key} label={key}>
      <Typography component="pre" variant="body2" sx={extraValueTypography}>
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </Typography>
    </ResponsiveKeyValueRow>
  ));

  return (
    <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
      <ResponsiveKeyValueTable size="small" tableLayout="fixed">
        {knownNodes}
        {extraNodes}
      </ResponsiveKeyValueTable>
    </Paper>
  );
}

export function shouldRenderFeeStatementTable(data: unknown): boolean {
  return isFeeStatementShape(data);
}
