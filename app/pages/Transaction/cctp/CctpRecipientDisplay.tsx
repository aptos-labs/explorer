import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {Box, Button, Tooltip, useTheme} from "@mui/material";
import {useCallback, useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import {truncateAddress} from "../../../utils/utils";
import type {FormattedCctpRecipient} from "./formatRecipient";

function CopyableAddress({value}: {value: string}) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [value],
  );

  return (
    <Tooltip title={copied ? "Copied" : value} enterDelay={500}>
      <Button
        onClick={copy}
        size="small"
        sx={{
          textTransform: "none",
          color: "inherit",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.neutralShade.lighter
              : theme.palette.background.default,
          border:
            theme.palette.mode === "light"
              ? `1px solid ${theme.palette.divider}`
              : undefined,
          borderRadius: 1,
          px: 1,
          py: 0.25,
          minWidth: 0,
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.neutralShade.main
                : theme.palette.action.hover,
          },
        }}
        endIcon={<ContentCopyIcon sx={{fontSize: 14, opacity: 0.75}} />}
      >
        {truncateAddress(value)}
      </Button>
    </Tooltip>
  );
}

/** Cross-chain mint recipient: copyable text only (no external chain explorer). */
export function CctpRecipientDisplay({
  recipient,
}: {
  recipient: FormattedCctpRecipient;
}) {
  if (recipient.aptosAddress) {
    return <HashButton hash={recipient.aptosAddress} type={HashType.ACCOUNT} />;
  }

  return (
    <Box component="span" sx={{display: "inline-flex"}}>
      <CopyableAddress value={recipient.display} />
    </Box>
  );
}
