import {Box, Chip, Link, Paper, Typography} from "@mui/material";
import {useTranslation} from "../../i18n";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../Table/ResponsiveKeyValueTable";
import type {ParsedPerEpochEncryptionKey} from "../../utils/perEpochEncryptionKey";
import HexBytesValue from "./HexBytesValue";
import JsonViewCard from "./JsonViewCard";

const FRAMEWORK_DECRYPTION_DOCS =
  "https://aptos.dev/move-reference/mainnet/aptos-framework/decryption";

type PerEpochEncryptionKeyViewProps = {
  parsed: ParsedPerEpochEncryptionKey;
  rawData: unknown;
};

export default function PerEpochEncryptionKeyView({
  parsed,
  rawData,
}: PerEpochEncryptionKeyViewProps) {
  const {t, formatBigInt} = useTranslation();
  const epochNumber = BigInt(parsed.epoch);
  const hasKey = parsed.encryptionKeyHex != null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        {t("confidential.introEpoch")}
        <Link
          href={FRAMEWORK_DECRYPTION_DOCS}
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>aptos_framework::decryption</code>
        </Link>
        .
      </Typography>

      <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
        <ResponsiveKeyValueTable size="small" tableLayout="fixed">
          <ResponsiveKeyValueRow
            labelKey="confidential.epoch"
            description={t("confidential.epochDescEnc")}
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {formatBigInt(epochNumber)}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            labelKey="confidential.encryptionKey"
            description={t("confidential.encryptionKeyDesc")}
          >
            <Chip
              label={hasKey ? t("confidential.set") : t("confidential.notSet")}
              size="small"
              color={hasKey ? "success" : "default"}
              variant={hasKey ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          {hasKey && parsed.encryptionKeyHex && (
            <ResponsiveKeyValueRow labelKey="confidential.keyBytes">
              <HexBytesValue
                hex={parsed.encryptionKeyHex}
                copyAriaLabel={t("confidential.copyEncryptionKey")}
              />
            </ResponsiveKeyValueRow>
          )}
        </ResponsiveKeyValueTable>
      </Paper>

      <Box sx={{mt: 3}}>
        <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
          {t("confidential.rawResourceData")}
        </Typography>
        <JsonViewCard data={rawData} collapsedByDefault />
      </Box>
    </Box>
  );
}
