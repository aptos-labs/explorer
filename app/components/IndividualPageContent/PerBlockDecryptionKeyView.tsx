import {Box, Chip, Link, Paper, Typography} from "@mui/material";
import {useTranslation} from "../../i18n";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../Table/ResponsiveKeyValueTable";
import type {ParsedPerBlockDecryptionKey} from "../../utils/perBlockDecryptionKey";
import HexBytesValue from "./HexBytesValue";
import JsonViewCard from "./JsonViewCard";

const FRAMEWORK_DECRYPTION_DOCS =
  "https://aptos.dev/move-reference/mainnet/aptos-framework/decryption";

type PerBlockDecryptionKeyViewProps = {
  parsed: ParsedPerBlockDecryptionKey;
  rawData: unknown;
};

export default function PerBlockDecryptionKeyView({
  parsed,
  rawData,
}: PerBlockDecryptionKeyViewProps) {
  const {t} = useTranslation();
  const epochNumber = BigInt(parsed.epoch);
  const roundNumber = BigInt(parsed.round);
  const hasKey = parsed.decryptionKeyHex != null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        {t("confidential.introBlock")}
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
            description={t("confidential.epochDescBlock")}
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {epochNumber.toLocaleString()}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            labelKey="confidential.round"
            description={t("confidential.roundDesc")}
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {roundNumber.toLocaleString()}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            labelKey="confidential.decryptionKey"
            description={t("confidential.decryptionKeyDesc")}
          >
            <Chip
              label={hasKey ? t("confidential.set") : t("confidential.notSet")}
              size="small"
              color={hasKey ? "success" : "default"}
              variant={hasKey ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          {hasKey && parsed.decryptionKeyHex && (
            <ResponsiveKeyValueRow labelKey="confidential.keyBytes">
              <HexBytesValue
                hex={parsed.decryptionKeyHex}
                copyAriaLabel={t("confidential.copyDecryptionKey")}
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
