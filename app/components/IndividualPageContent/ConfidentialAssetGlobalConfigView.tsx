import {Box, Chip, Link, Paper, Typography} from "@mui/material";
import {useTranslation} from "../../i18n";
import HashButton, {HashType} from "../HashButton";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../Table/ResponsiveKeyValueTable";
import type {ParsedConfidentialAssetGlobalConfig} from "../../utils/confidentialAssetGlobalConfig";
import HexBytesValue from "./HexBytesValue";
import JsonViewCard from "./JsonViewCard";

const CONFIDENTIAL_ASSET_DOCS =
  "https://aptos.dev/move-reference/mainnet/aptos-framework/confidential_asset";

type ConfidentialAssetGlobalConfigViewProps = {
  parsed: ParsedConfidentialAssetGlobalConfig;
  rawData: unknown;
};

export default function ConfidentialAssetGlobalConfigView({
  parsed,
  rawData,
}: ConfidentialAssetGlobalConfigViewProps) {
  const {t, formatBigInt} = useTranslation();
  const auditorEpoch = BigInt(parsed.globalAuditor.epoch);
  const hasAuditorKey = parsed.globalAuditor.encryptionKeyHex != null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        {t("confidential.introGlobal")}
        <Link
          href={CONFIDENTIAL_ASSET_DOCS}
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>aptos_framework::confidential_asset</code>
        </Link>
        .
      </Typography>

      <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
        <ResponsiveKeyValueTable size="small" tableLayout="fixed">
          <ResponsiveKeyValueRow
            labelKey="confidential.allowList"
            description={t("confidential.allowListDesc")}
          >
            <Chip
              label={
                parsed.allowListEnabled
                  ? t("flags.enabled")
                  : t("flags.disabled")
              }
              size="small"
              color={parsed.allowListEnabled ? "warning" : "default"}
              variant={parsed.allowListEnabled ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            labelKey="confidential.globalAuditorKey"
            description={t("confidential.globalAuditorKeyDesc")}
          >
            <Chip
              label={
                hasAuditorKey ? t("confidential.set") : t("confidential.notSet")
              }
              size="small"
              color={hasAuditorKey ? "success" : "default"}
              variant={hasAuditorKey ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          {hasAuditorKey && parsed.globalAuditor.encryptionKeyHex && (
            <ResponsiveKeyValueRow labelKey="confidential.auditorKeyBytes">
              <HexBytesValue
                hex={parsed.globalAuditor.encryptionKeyHex}
                copyAriaLabel={t("confidential.copyAuditorKey")}
              />
            </ResponsiveKeyValueRow>
          )}

          <ResponsiveKeyValueRow
            labelKey="confidential.globalAuditorEpoch"
            description={t("confidential.globalAuditorEpochDesc")}
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {formatBigInt(auditorEpoch)}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            labelKey="confidential.poolExtendRef"
            description={t("confidential.poolExtendRefDesc")}
          >
            {parsed.extendRefObjectAddress ? (
              <HashButton
                hash={parsed.extendRefObjectAddress}
                type={HashType.OBJECT}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )}
          </ResponsiveKeyValueRow>
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
