import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Chip,
  CardMedia,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";

export const Route = createFileRoute("/token/$tokenId")({
  head: ({params}) => ({
    meta: [
      {title: `Token ${truncateAddress(params.tokenId)} | Aptos Explorer`},
      {
        name: "description",
        content: `View NFT token details for ${params.tokenId} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View NFT token details for ${params.tokenId} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/token/${params.tokenId}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View NFT token details for ${params.tokenId} on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/token/${params.tokenId}`}],
  }),
  component: TokenPage,
});

function TokenPage() {
  const {tokenId} = Route.useParams();
  const {sdk_v2_client, network_name} = useGlobalState();

  // Fetch token data
  const {data: tokenData, isLoading} = useQuery({
    queryKey: ["token", tokenId, network_name],
    queryFn: async () => {
      try {
        // Try to get token data from the token address
        const resources = await sdk_v2_client.getAccountResources({
          accountAddress: tokenId,
        });

        // Look for token resource
        const tokenResource = resources.find(
          (r) =>
            r.type === "0x4::token::Token" || r.type.includes("token::Token"),
        );

        if (tokenResource) {
          const data = tokenResource.data as {
            collection?: {inner?: string};
            description?: string;
            name?: string;
            uri?: string;
          };
          return {
            name: data?.name || "Unknown Token",
            description: data?.description || "",
            uri: data?.uri || "",
            collection: data?.collection?.inner || "",
          };
        }

        return null;
      } catch {
        return null;
      }
    },
  });

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Token Image */}
        <Grid size={{xs: 12, md: 5}}>
          <Card>
            {tokenData?.uri ? (
              <CardMedia
                component="img"
                image={tokenData.uri}
                alt={tokenData.name}
                sx={{
                  height: 400,
                  objectFit: "contain",
                  backgroundColor: "background.default",
                }}
                onError={(e) => {
                  // Hide image on error
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "background.default",
                }}
              >
                <Typography color="text.secondary">
                  {isLoading ? <Skeleton width={100} /> : "No image available"}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Token Details */}
        <Grid size={{xs: 12, md: 7}}>
          <Box sx={{mb: 3}}>
            <Chip label="NFT" size="small" sx={{mb: 1}} />
            <Typography variant="h4" gutterBottom>
              {isLoading ? (
                <Skeleton width={250} />
              ) : (
                tokenData?.name || "Unknown Token"
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                wordBreak: "break-all",
                color: "text.secondary",
              }}
            >
              {tokenId}
            </Typography>
          </Box>

          <Card sx={{mb: 3}}>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Description
              </Typography>
              <Typography>
                {isLoading ? (
                  <Skeleton height={60} />
                ) : tokenData?.description ? (
                  tokenData.description
                ) : (
                  "No description available"
                )}
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6}}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Token ID
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                      fontSize: "0.875rem",
                    }}
                  >
                    {truncateAddress(tokenId, 12)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Collection
                  </Typography>
                  {isLoading ? (
                    <Skeleton width={150} />
                  ) : tokenData?.collection ? (
                    <Link
                      to="/account/$address"
                      params={{address: tokenData.collection}}
                      style={{textDecoration: "none"}}
                    >
                      <Typography
                        sx={{fontFamily: "monospace", fontSize: "0.875rem"}}
                      >
                        {truncateAddress(tokenData.collection)}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography>-</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* View Account Link */}
          <Box sx={{mt: 3}}>
            <Link
              to="/account/$address"
              params={{address: tokenId}}
              style={{textDecoration: "none"}}
            >
              <Typography color="primary">View Token Account →</Typography>
            </Link>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
