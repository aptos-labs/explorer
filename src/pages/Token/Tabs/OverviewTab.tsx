import {useParams} from "react-router-dom";
import {Box, Stack, Typography, CircularProgress} from "@mui/material";
import React, {Fragment, useState, useEffect} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {useGetTokenOwners} from "../../../api/hooks/useGetAccountTokens";
import {Current_Token_Datas_V2} from "aptos";
import {
  isValidIpfsUrl,
  isValidUrl,
  toIpfsUrl,
  toIpfsDisplayUrl,
} from "../../utils";

function OwnersRow() {
  const {tokenId} = useParams();
  const {data: owners} = useGetTokenOwners(tokenId);

  return (
    <ContentRow
      title={"Owner(s):"}
      value={
        <Stack direction="row" spacing={1}>
          {(owners ?? []).map((owner: {owner_address: string}) => (
            <HashButton hash={owner?.owner_address} type={HashType.ACCOUNT} />
          ))}
        </Stack>
      }
    />
  );
}

type OverviewTabProps = {
  data: Current_Token_Datas_V2;
};

// Image loading states
type ImageState = "loading" | "loaded" | "failed";

// Normalize a URL for loading (convert IPFS to gateway URL)
function getLoadUrl(url: string): string {
  if (!url) return url;
  return isValidIpfsUrl(url) ? toIpfsUrl(url) : url;
}

// Normalize a URL for display (show ipfs:// protocol)
function getDisplayUrl(url: string): string {
  if (!url) return url;
  return isValidIpfsUrl(url) ? toIpfsDisplayUrl(url) : url;
}

// TODO: add more contents
export default function OverviewTab({data}: OverviewTabProps) {
  const [imageState, setImageState] = useState<ImageState>("loading");
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const rawUrl = data?.token_uri ?? "";
  const metadataLoadUrl = getLoadUrl(rawUrl);
  const metadataDisplayUrl = getDisplayUrl(rawUrl);

  // Check if URL looks like it could be a direct image
  const looksLikeDirectImage =
    metadataLoadUrl &&
    (metadataLoadUrl.endsWith(".png") ||
      metadataLoadUrl.endsWith(".jpg") ||
      metadataLoadUrl.endsWith(".jpeg") ||
      metadataLoadUrl.endsWith(".gif") ||
      metadataLoadUrl.endsWith(".webp") ||
      metadataLoadUrl.endsWith(".svg"));

  // Fetch metadata JSON to extract image URL
  useEffect(() => {
    // If it looks like a direct image URL, don't try to fetch as JSON
    if (looksLikeDirectImage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedImageUrl(metadataLoadUrl);
      return;
    }

    if (!metadataLoadUrl || !isValidUrl(metadataLoadUrl)) {
      return;
    }

    setIsLoadingMetadata(true);
    setImageState("loading");

    // Try to fetch metadata as JSON
    fetch(metadataLoadUrl)
      .then((response) => {
        const contentType = response.headers.get("content-type");
        // If it's JSON, parse it and look for image field
        if (
          contentType?.includes("application/json") ||
          contentType?.includes("text/plain")
        ) {
          return response.json();
        }
        // If it's an image, use the URL directly
        if (contentType?.startsWith("image/")) {
          return {_directImage: true};
        }
        // Try parsing as JSON anyway (some servers don't set content-type correctly)
        return response.json();
      })
      .then((metadata) => {
        if (metadata._directImage) {
          setResolvedImageUrl(metadataLoadUrl);
        } else if (metadata.image) {
          // Found image field in JSON metadata - normalize it for loading
          setResolvedImageUrl(getLoadUrl(metadata.image));
        } else if (metadata.animation_url) {
          // Some NFTs use animation_url for the media
          setResolvedImageUrl(getLoadUrl(metadata.animation_url));
        } else {
          // No image field found, try using the URL directly
          setResolvedImageUrl(metadataLoadUrl);
        }
      })
      .catch(() => {
        // Failed to parse as JSON, try using URL directly as image
        setResolvedImageUrl(metadataLoadUrl);
      })
      .finally(() => {
        setIsLoadingMetadata(false);
      });
  }, [metadataLoadUrl, looksLikeDirectImage]);

  const showImage = resolvedImageUrl && imageState !== "failed";

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Token Name:"} value={data?.token_name} />
        <OwnersRow />
        <ContentRow
          title={"Collection Name:"}
          value={data?.current_collection?.collection_name}
        />
        <ContentRow
          title={"Creator:"}
          value={
            <HashButton
              hash={data?.current_collection?.creator_address ?? ""}
              type={HashType.ACCOUNT}
            />
          }
        />
        <ContentRow
          title={"Metadata:"}
          value={
            <Stack spacing={1}>
              {/* Always show the display URL first (ipfs:// for IPFS links) */}
              {metadataDisplayUrl && (
                <Typography
                  fontSize="0.8rem"
                  sx={{wordBreak: "break-all"}}
                  component="div"
                >
                  {isValidUrl(metadataLoadUrl) ? (
                    <a
                      href={metadataLoadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{color: "inherit"}}
                    >
                      {metadataDisplayUrl}
                    </a>
                  ) : (
                    metadataDisplayUrl
                  )}
                </Typography>
              )}
              {/* Show loading spinner while fetching metadata */}
              {isLoadingMetadata && (
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                  <CircularProgress size={16} />
                  <Typography fontSize="0.75rem" color="text.secondary">
                    Loading metadata...
                  </Typography>
                </Box>
              )}
              {/* Show image once resolved */}
              {showImage && !isLoadingMetadata && (
                <Box
                  sx={{
                    visibility: imageState === "loaded" ? "visible" : "hidden",
                    height: imageState === "loaded" ? "auto" : 0,
                    overflow: "hidden",
                  }}
                >
                  <a
                    href={resolvedImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={resolvedImageUrl}
                      alt={data?.token_name}
                      width={150}
                      onLoad={() => setImageState("loaded")}
                      onError={() => setImageState("failed")}
                    />
                  </a>
                </Box>
              )}
            </Stack>
          }
        />
      </ContentBox>
      <ContentBox>
        {data.token_standard == "v2" ? (
          <Fragment>
            <ContentRow
              title={"Collection id:"}
              value={
                <HashButton
                  hash={data?.current_collection?.collection_id ?? ""}
                  type={HashType.OBJECT}
                />
              }
            />

            <ContentRow
              title={"Token id:"}
              value={
                <HashButton
                  hash={data?.token_data_id ?? ""}
                  type={HashType.OBJECT}
                />
              }
            />
          </Fragment>
        ) : (
          <Fragment></Fragment>
        )}
        {data?.largest_property_version_v1 && (
          <ContentRow
            title={"Largest Property Version:"}
            value={data?.largest_property_version_v1}
          />
        )}
        <ContentRow
          title={"Supply:"}
          value={data?.current_collection?.current_supply}
        />
        <ContentRow
          title={"Maximum:"}
          value={data?.current_collection?.max_supply}
        />
        <ContentRow
          title={"Token Properties:"}
          value={
            <JsonViewCard data={data?.token_properties} collapsedByDefault />
          }
        />
        {data?.last_transaction_version && (
          <ContentRow
            title={"Last transaction:"}
            value={
              <HashButton
                hash={data?.last_transaction_version.toString()}
                type={HashType.TRANSACTION}
              />
            }
          />
        )}
      </ContentBox>
    </Box>
  );
}
