import {Stack, Typography} from "@mui/material";
import React from "react";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {labsBannedCollections} from "../../constants";
import StyledTooltip from "../../components/StyledTooltip";
import {Dangerous} from "@mui/icons-material";

type TokenTitleProps = {
  name: string;
  tokenDataId: string;
  tokenCollection: string;
  imageUrl?: string;
};

export default function TokenTitle({
  name,
  tokenDataId,
  tokenCollection,
  imageUrl,
}: TokenTitleProps) {
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
      <PageMetadata
        title={`${name} - NFT Token`}
        description={`View NFT "${name}" from the ${tokenCollection || "unknown"} collection on Aptos. See token metadata, ownership history, properties, and collection details.`}
        type="token"
        keywords={[
          "NFT",
          "token",
          name,
          tokenCollection,
          "digital collectible",
          "Aptos NFT",
        ].filter(Boolean)}
        canonicalPath={`/token/${tokenDataId}`}
        image={imageUrl}
      />
      <Typography variant="h3">{name}</Typography>
      {badge}
    </Stack>
  );
}
