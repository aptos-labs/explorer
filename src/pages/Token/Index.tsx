import {useParams} from "react-router-dom";
import {gql, useQuery} from "@apollo/client";
import {Stack, Grid} from "@mui/material";
import React from "react";
import HeaderSearch from "../layout/Search/Index";
import TokenTitle from "./Title";
import TokenTabs from "./Tabs";

const TOKEN_QUERY = gql`
  {
    token_datas(where: {name_hash: {}, name: {_eq: "Aptos Zero: 7"}}) {
      name
      collection_name
      creator_address
      description_mutable
    }
  }
`;

export default function TokenPage() {
  const {param} = useParams();

  if (typeof param !== "string") {
    return null;
  }

  const {loading, error, data} = useQuery(TOKEN_QUERY);

  if (loading || error || !data) {
    // TODO: error handling
    return null;
  }

  // TODO: add graphql data typing
  const tokenDatas = data?.token_datas ?? [];
  if (tokenDatas.length === 0) {
    return null;
  }
  const token = tokenDatas[0];

  return (
    <Grid container spacing={1}>
      <HeaderSearch />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TokenTitle name={token?.name} />
          <TokenTabs data={token} />
        </Stack>
      </Grid>
    </Grid>
  );
}
