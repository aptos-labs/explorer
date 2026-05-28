import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import {useCallback, useState} from "react";
import {truncate} from "../../utils/utils";

const hexTypography = {
  m: 0,
  fontFamily: "monospace",
  fontSize: "0.85rem",
  wordBreak: "break-all",
  overflowWrap: "anywhere",
} as const;

type HexBytesValueProps = {
  hex: string;
  copyAriaLabel?: string;
};

export default function HexBytesValue({
  hex,
  copyAriaLabel = "Copy hex bytes",
}: HexBytesValueProps) {
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
      <Tooltip title={copied ? "Copied!" : "Copy full value"}>
        <IconButton
          size="small"
          onClick={handleCopy}
          aria-label={copyAriaLabel}
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
