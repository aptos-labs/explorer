import {Box, Chip, Link, Paper, Typography} from "@mui/material";
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
  const auditorEpoch = BigInt(parsed.globalAuditor.epoch);
  const hasAuditorKey = parsed.globalAuditor.encryptionKeyHex != null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        Protocol-wide confidential asset settings on the Aptos framework account
        (allow list, global auditor, pool object). Asset-specific auditors
        override the global auditor when set. See{" "}
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
            label="Allow list"
            description="When enabled, only allow-listed asset types can use confidential transfers."
          >
            <Chip
              label={parsed.allowListEnabled ? "Enabled" : "Disabled"}
              size="small"
              color={parsed.allowListEnabled ? "warning" : "default"}
              variant={parsed.allowListEnabled ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            label="Global auditor key"
            description="Optional auditor encryption key; asset-specific auditors take precedence."
          >
            <Chip
              label={hasAuditorKey ? "Set" : "Not set"}
              size="small"
              color={hasAuditorKey ? "success" : "default"}
              variant={hasAuditorKey ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          {hasAuditorKey && parsed.globalAuditor.encryptionKeyHex && (
            <ResponsiveKeyValueRow label="Auditor key bytes (hex)">
              <HexBytesValue
                hex={parsed.globalAuditor.encryptionKeyHex}
                copyAriaLabel="Copy auditor encryption key bytes"
              />
            </ResponsiveKeyValueRow>
          )}

          <ResponsiveKeyValueRow
            label="Global auditor epoch"
            description="Increments when the global auditor key is installed or rotated."
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {auditorEpoch.toLocaleString()}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            label="Pool extend ref"
            description="Object used to derive the signer that owns confidential-asset pools."
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
          Raw resource data
        </Typography>
        <JsonViewCard data={rawData} collapsedByDefault />
      </Box>
    </Box>
  );
}
