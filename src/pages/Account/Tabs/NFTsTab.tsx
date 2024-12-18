import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {useQuery, gql} from "@apollo/client";

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

export type TokenResponse = {
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

const GET_NFTS = gql`
  query GetNFTs($owner_address: String!) {
    current_token_datas_v2(
      where: {
        current_token_ownerships: {
          owner_address: {_eq: $owner_address}
          amount: {_gt: "0"}
        }
      }
    ) {
      collection_id
      token_uri
      token_name
      token_data_id
      current_token_ownerships(where: {owner_address: {_eq: $owner_address}}) {
        owner_address
        amount
        last_transaction_version
      }
    }
  }
`;

export default function NFTsTab({address}: NFTsTabProps) {
  const {loading, error, data} = useQuery(GET_NFTS, {
    variables: {owner_address: address},
  });

  const digitalAssets: DigitalAsset[] =
    data?.current_token_datas_v2.map((nft: any) => ({
      token_data_id: nft.token_data_id,
      current_token_data: {
        token_name: nft.token_name,
        token_uri: nft.token_uri,
        description: "",
      },
    })) || [];

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
        <Typography color="error">
          Error loading NFTs: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!digitalAssets.length) {
    return <EmptyTabContent message="No NFTs found for this account" />;
  }

  const convertIpfsToHttps = (ipfsUrl: string) => {
    if (!ipfsUrl) return "/placeholder-image.png";

    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace("ipfs://", "")}`;
    }

    return ipfsUrl;
  };

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
