import {Box, Chip, Link, Paper, Typography} from "@mui/material";
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
  const epochNumber = BigInt(parsed.epoch);
  const roundNumber = BigInt(parsed.round);
  const hasKey = parsed.decryptionKeyHex != null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        Per-block decryption key updated in each block prologue; used to decrypt
        encrypted transactions in that block. See{" "}
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
            description="Epoch of the block this key applies to."
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {epochNumber.toLocaleString()}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            label="Round"
            description="Consensus round within the epoch."
          >
            <Typography variant="body1" component="span" sx={{fontWeight: 600}}>
              {roundNumber.toLocaleString()}
            </Typography>
          </ResponsiveKeyValueRow>

          <ResponsiveKeyValueRow
            label="Decryption key"
            description="Key for this block; None until the prologue installs one."
          >
            <Chip
              label={hasKey ? "Set" : "Not set"}
              size="small"
              color={hasKey ? "success" : "default"}
              variant={hasKey ? "filled" : "outlined"}
            />
          </ResponsiveKeyValueRow>

          {hasKey && parsed.decryptionKeyHex && (
            <ResponsiveKeyValueRow label="Key bytes (hex)">
              <HexBytesValue
                hex={parsed.decryptionKeyHex}
                copyAriaLabel="Copy decryption key bytes"
              />
            </ResponsiveKeyValueRow>
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
