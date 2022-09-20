import {useParams} from "react-router-dom";
import {gql, useQuery} from "@apollo/client";
import {Stack, Grid} from "@mui/material";
import React from "react";
import HeaderSearch from "../layout/Search/Index";
// import {BLOCK_DUMMY_DATA} from "./data";
// import BlockTitle from "./Title";
// import BlockTabs from "./Tabs";

// creator address
// collection name
// token name
// property version

const MY_QUERY = gql`
  {
    token_datas(where: {name_hash: {}, name: {_eq: "Aptos Zero: 7"}}) {
      name
      collection_name
      creator_address
      supply
      transaction_version
      uri_mutable
      description_mutable
      default_properties
      metadata_uri
      collection_name_hash
      inserted_at
      largest_property_version
      maximum
      maximum_mutable
      name_hash
      payee_address
      properties_mutable
      royalty_mutable
      royalty_points_denominator
      royalty_points_numerator
    }
  }
`;

export default function TokenPage() {
  const {param} = useParams();
  const {loading, error, data} = useQuery(MY_QUERY);

  console.log(data);

  if (typeof param !== "string") {
    return null;
  }

  //   const data = BLOCK_DUMMY_DATA;

  return (
    <Grid container spacing={1}>
      <HeaderSearch />
      <Grid item xs={12}>
        token page
        {/* <Stack direction="column" spacing={4} marginTop={2}>
          <BlockTitle height={data.block_height} />
          <BlockTabs data={data} />
        </Stack> */}
      </Grid>
    </Grid>
  );
}
