import {Alert, Grid, Stack} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {useGetBlockByHeight} from "../../api/hooks/useGetBlock";
import PageHeader from "../layout/PageHeader";
import BlockError from "./Error";
import BlockTabs from "./Tabs";
import BlockTitle from "./Title";

export default function BlockPage() {
  const params = useParams({strict: false}) as {
    height?: string;
    tab?: string;
  };
  const height = params?.height;
  const actualHeight = parseInt(height ?? "", 10);

  const {data, isLoading, error} = useGetBlockByHeight({
    height: actualHeight,
  });

  if (isLoading) {
    return null;
  }

  if (error) {
    return <BlockError error={error} height={height ?? ""} />;
  }

  if (!data) {
    return (
      <Alert severity="error">
        Got an empty response fetching block with height {height}
        <br />
        Try again later
      </Alert>
    );
  }

  return (
    <Grid container spacing={1}>
      <PageHeader />
      <Grid size={{xs: 12}}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <BlockTitle height={actualHeight} pathTab={params.tab} />
          <BlockTabs data={data} />
        </Stack>
      </Grid>
    </Grid>
  );
}
