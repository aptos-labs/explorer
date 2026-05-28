import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Chip,
  IconButton,
  Link,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {useCallback, useState} from "react";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../Table/ResponsiveKeyValueTable";
import type {ParsedPerEpochEncryptionKey} from "../../utils/perEpochEncryptionKey";
import {truncate} from "../../utils/utils";
import JsonViewCard from "./JsonViewCard";

const FRAMEWORK_DECRYPTION_DOCS =
  "https://aptos.dev/move-reference/mainnet/aptos-framework/decryption";

const hexTypography = {
  m: 0,
  fontFamily: "monospace",
  fontSize: "0.85rem",
  wordBreak: "break-all",
  overflowWrap: "anywhere",
} as const;

function HexBytesValue({hex}: {hex: string}) {
  const [copied, setCopied] = useState(false);
  const display = hex.length > 72 ? truncate(hex, 18, 10, "…") : hex;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable.
    }
  }, [hex]);

  return (
    <Box sx={{display: "flex", alignItems: "flex-start", gap: 0.5}}>
      <Typography component="pre" variant="body2" sx={hexTypography}>
        {display}
      </Typography>
      <Tooltip title={copied ? "Copied!" : "Copy full key bytes"}>
        <IconButton
          size="small"
          onClick={handleCopy}
          aria-label="Copy encryption key bytes"
          sx={{mt: -0.25}}
        >
          {copied ? (
            <CheckIcon sx={{fontSize: 16}} color="success" />
          ) : (
            <ContentCopyIcon sx={{fontSize: 16}} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

type PerEpochEncryptionKeyViewProps = {
  parsed: ParsedPerEpochEncryptionKey;
  /** Shown under "Raw resource data" for operators who need the REST shape. */
  rawData: unknown;
};

/**
 * Human-readable view of `0x1::decryption::PerEpochEncryptionKey` (Chunky DKG epoch key).
 */
export default function PerEpochEncryptionKeyView({
  parsed,
  rawData,
}: PerEpochEncryptionKeyViewProps) {
  const epochNumber = BigInt(parsed.epoch);
  const hasKey = parsed.encryptionKeyHex != null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        Epoch-scoped encryption key from Chunky DKG, used for encrypted
        transactions during that epoch. Stored on the Aptos framework account;
        see{" "}
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
            label="Epoch"
            description="Epoch this key is valid for (matches the on-chain u64)."
          >
            <Typography
              variant="body1"
              component="span"
              sx={{fontWeight: 600}}
            >
              {epochNumber.toLocaleString()}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{display: "block", mt: 0.25}}
            >
              ({parsed.epoch})
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            label="Encryption key"
            description="Derived from the DKG result; None until the epoch key is installed."
          >
            <Chip
              label={hasKey ? "Set" : "Not set"}
              size="small"
              color={hasKey ? "success" : "default"}
              variant={hasKey ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          {hasKey && parsed.encryptionKeyHex && (
            <>
              <ResponsiveKeyValueRow
                label="Key size"
                description="Length of the serialized public key material (bytes)."
              >
                <Typography variant="body2">
                  {parsed.encryptionKeyByteLength != null
                    ? `${parsed.encryptionKeyByteLength.toLocaleString()} bytes`
                    : "—"}
                </Typography>
              </ResponsiveKeyValueRow>
              <ResponsiveKeyValueRow label="Key bytes (hex)">
                <HexBytesValue hex={parsed.encryptionKeyHex} />
              </ResponsiveKeyValueRow>
            </>
          )}
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
