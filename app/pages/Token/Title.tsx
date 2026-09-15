import {Dangerous} from "@mui/icons-material";
import {Stack, Typography} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import StyledTooltip from "../../components/StyledTooltip";
import {labsBannedCollections} from "../../constants";
import {truncateAddress, tryStandardizeAddress} from "../../utils";
import {useTranslation} from "../../i18n";
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
  const {t} = useTranslation();
  let badge = null;
  const reason = labsBannedCollections[tokenCollection];
  if (reason) {
    const tooltipMessage = t("verified.tooltip.labsBannedReason", {reason});
    badge = (
      <StyledTooltip title={tooltipMessage}>
        <Dangerous fontSize="small" color="error" />
      </StyledTooltip>
    );
  }

  const canonicalTokenId = tryStandardizeAddress(urlTokenId) ?? urlTokenId;
  const hasTokenId = Boolean(canonicalTokenId.trim());
  const canonicalPath = hasTokenId
    ? `/token/${canonicalTokenId}/${pathTab}`
    : undefined;
  const tabHead = getTokenTabHeadLabel(pathTab, t);
  const metadataTitle = t("pages.tokens.metaTitle", {
    tab: tabHead,
    id: truncateAddress(canonicalTokenId),
  });
  const metadataDescription = t("pages.tokens.metaDescription", {
    tab: tabHead,
    id: canonicalTokenId,
  });

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        marginX: 1,
      }}
    >
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
        {...(canonicalPath ? {canonicalPath} : {})}
        image={imageUrl}
      />
      <Typography variant="h3" component="h1">
        {name}
      </Typography>
      {badge}
    </Stack>
  );
}
