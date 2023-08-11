import {useParams} from "react-router-dom";
import {Stack, Grid} from "@mui/material";
import React from "react";
import TokenTitle from "./Title";
import TokenTabs from "./Tabs";
import PageHeader from "../layout/PageHeader";
import EmptyTabContent from "../../components/IndividualPageContent/EmptyTabContent";
import {useGetTokenData} from "../../api/hooks/useGetAccountTokens";

export default function TokenPage() {
  const {tokenId} = useParams();
  const {data} = useGetTokenData(tokenId);

  if (!data) {
    // TODO: error handling
    return null;
  }
  const tokenDatas = data ?? [];
  if (tokenDatas.length === 0) {
    return <EmptyTabContent />;
  }
  const token = tokenDatas[0];

  return (
    <Grid container spacing={1}>
      <PageHeader />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TokenTitle name={token?.token_name} />
          <TokenTabs data={token} />
        </Stack>
      </Grid>
    </Grid>
  );
}
