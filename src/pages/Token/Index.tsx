import {useParams} from "react-router-dom";
import {gql, useQuery} from "@apollo/client";
import {Stack, Grid} from "@mui/material";
import React from "react";
import TokenTitle from "./Title";
import TokenTabs from "./Tabs";
import PageHeader from "../../components/PageHeader";
import EmptyTabContent from "../../components/IndividualPageContent/EmptyTabContent";

const TOKEN_QUERY = gql`
  query TokenData($token_id: String) {
    current_token_datas(where: {token_data_id_hash: {_eq: $token_id}}) {
      token_data_id_hash
      name
      collection_name
      creator_address
      default_properties
      largest_property_version
      maximum
      metadata_uri
      payee_address
      royalty_points_denominator
      royalty_points_numerator
      supply
    }
  }
`;

export default function TokenPage() {
  const {tokenId} = useParams();

  const {loading, error, data} = useQuery(TOKEN_QUERY, {
    variables: {
      token_id: tokenId,
    },
  });

  if (loading || error || !data) {
    // TODO: error handling
    return null;
  }

  // TODO: add graphql data typing
  const tokenDatas = data?.current_token_datas ?? [];
  if (tokenDatas.length === 0) {
    return <EmptyTabContent />;
  }
  const token = tokenDatas[0];

  return (
    <Grid container spacing={1}>
      <PageHeader />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TokenTitle name={token?.name} />
          <TokenTabs data={token} />
        </Stack>
      </Grid>
    </Grid>
  );
}
