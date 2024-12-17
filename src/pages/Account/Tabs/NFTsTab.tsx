import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import React, {useEffect, useState} from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {useGlobalState} from "../../../global-config/GlobalConfig";

type NFTsTabProps = {
  address: string;
};

type DigitalAsset = {
  token_data_id: string;
  current_token_data: {
    token_name: string;
    token_uri: string;
    description: string;
  };
};

type TokenResponse = {
  syncSqlResponse: {
    result: {
      rows: Array<{
        token_id: number;
        contract: string;
        distinct_event_id: string;
        transaction_hash: string;
        object: string;
      }>;
    };
  };
};

export type NFTInfo = {
  tokenAddress: string;
  tokenData: {
    name: string;
    uri: string;
    description: string;
    collection: string;
  };
};

export default function NFTsTab({address}: NFTsTabProps) {
  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state] = useGlobalState();

  useEffect(() => {
    const fetchTokenIds = async () => {
      try {
        const response = await fetch("/.netlify/functions/getTokenIds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({owner: address}),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch token IDs");
        }

        const data: TokenResponse = await response.json();
        return data.syncSqlResponse.result.rows || [];
      } catch (error) {
        console.error("Error fetching token IDs:", error);
        throw error;
      }
    };

    const fetchNFTInfo = async (objectId: string) => {
      try {
        // Query the Movement explorer endpoint for token resources
        const response = await fetch(
          `${state.network_value}/accounts/${objectId}/resources`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch NFT info");
        }

        const data = await response.json();

        // Find the token resource data
        const tokenResource = data.find(
          (resource: any) => resource.type === "0x4::token::Token",
        );

        if (!tokenResource) {
          throw new Error("Token resource not found");
        }

        // Extract metadata from the token resource
        const metadata = tokenResource.data;

        // Transform the data into the required format
        return {
          tokenAddress: objectId,
          tokenData: {
            name: metadata.name || "",
            uri: metadata.uri || "",
            description: metadata.description || "",
            collection: metadata.collection?.inner || "", // Handle nested collection data
          },
        };
      } catch (error) {
        console.error("Error fetching NFT info:", error);
        throw error;
      }
    };

    const fetchAllNFTs = async () => {
      try {
        // First get all token IDs
        const tokenIds = await fetchTokenIds();

        // Then fetch info for each token
        const nftPromises = tokenIds.map((token) =>
          fetchNFTInfo(token.object.toString()),
        );

        const nfts = await Promise.all(nftPromises);

        // Transform to DigitalAsset format
        setDigitalAssets(
          nfts.map((nft) => ({
            token_data_id: nft.tokenAddress,
            current_token_data: {
              token_name: nft.tokenData.name,
              token_uri: nft.tokenData.uri,
              description: nft.tokenData.description,
            },
          })),
        );

        setLoading(false);
      } catch (error) {
        setError("Failed to fetch NFTs");
        console.error("Error in NFT fetch process:", error);
        setLoading(false);
      }
    };

    fetchAllNFTs();
  }, [address, state.network_value]);

  const convertIpfsToHttps = (ipfsUrl: string) => {
    if (!ipfsUrl) return "/placeholder-image.png";

    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace("ipfs://", "")}`;
    }

    return ipfsUrl;
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading NFTs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!digitalAssets.length) {
    return <EmptyTabContent message="No NFTs found for this account" />;
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {digitalAssets.map((asset) => (
          <Grid item xs={12} sm={4} md={4} key={asset.token_data_id}>
            <Card>
              <CardMedia
                component="img"
                image={convertIpfsToHttps(asset.current_token_data.token_uri)}
                alt={asset.current_token_data.token_name}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.png";
                }}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {asset.current_token_data.token_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.current_token_data.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
