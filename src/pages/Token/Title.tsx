import {Stack, Typography} from "@mui/material";
import React from "react";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {labsBannedCollections} from "../../constants";
import StyledTooltip from "../../components/StyledTooltip";
import {Dangerous} from "@mui/icons-material";

type BlockTitleProps = {
  name: string;
  tokenDataId: string;
  tokenCollection: string;
};

export default function TokenTitle({
  name,
  tokenDataId,
  tokenCollection,
}: BlockTitleProps) {
  usePageMetadata({title: `Token ${name} (${tokenDataId})`});
  let badge = null;
  const reason = labsBannedCollections[tokenCollection];
  if (reason) {
    let tooltipMessage = `This asset has been marked as a scam or dangerous, please avoid using this asset.`;
    tooltipMessage += ` Reason: (${reason})`;
    badge = (
      <StyledTooltip title={tooltipMessage}>
        <Dangerous fontSize="small" color="error" />
      </StyledTooltip>
    );
  }

  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">{name}</Typography>
      {badge}
    </Stack>
  );
}
