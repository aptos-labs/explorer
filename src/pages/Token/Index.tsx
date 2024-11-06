import {useParams} from "react-router-dom";
import {Stack, Grid2} from "@mui/material";
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
  if (!data) {
    return <EmptyTabContent />;
  }

  return (
    <Grid2 container spacing={1}>
      <PageHeader />
      <Grid2 size={{xs: 12}}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TokenTitle name={data.token_name} />
          <TokenTabs data={data} />
        </Stack>
      </Grid2>
    </Grid2>
  );
}
