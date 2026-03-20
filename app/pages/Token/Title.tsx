import {Dangerous} from "@mui/icons-material";
import {Stack, Typography} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import StyledTooltip from "../../components/StyledTooltip";
import {labsBannedCollections} from "../../constants";
import {truncateAddress, tryStandardizeAddress} from "../../utils";
import {getTokenTabHeadLabel} from "./tokenTabMeta";

type TokenTitleProps = {
  name: string;
  tokenCollection: string;
  imageUrl?: string;
  /** Raw `tokenId` path param for canonical URL */
  urlTokenId: string;
  pathTab?: string;
};

export default function TokenTitle({
  name,
  tokenCollection,
  imageUrl,
  urlTokenId,
  pathTab = "overview",
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

  const canonicalTokenId = tryStandardizeAddress(urlTokenId) ?? urlTokenId;
  const tabHead = getTokenTabHeadLabel(pathTab);
  const metadataTitle = `${tabHead} | Token ${truncateAddress(canonicalTokenId)}`;
  const metadataDescription = `View ${tabHead.toLowerCase()} for NFT token ${canonicalTokenId} on the Aptos blockchain.`;

  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <PageMetadata
        title={metadataTitle}
        description={metadataDescription}
        type="token"
        keywords={[
          "NFT",
          "token",
          name,
          tokenCollection,
          "digital collectible",
          "Aptos NFT",
        ].filter(Boolean)}
        canonicalPath={`/token/${canonicalTokenId}/${pathTab}`}
        image={imageUrl}
      />
      <Typography variant="h3" component="h1">
        {name}
      </Typography>
      {badge}
    </Stack>
  );
}
