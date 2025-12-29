import {useParams} from "react-router-dom";
import {Stack, Grid, CircularProgress, Box} from "@mui/material";
import TokenTitle from "./Title";
import TokenTabs from "./Tabs";
import PageHeader from "../layout/PageHeader";
import EmptyTabContent from "../../components/IndividualPageContent/EmptyTabContent";
import {useGetTokenData} from "../../api/hooks/useGetAccountTokens";
import TokenError from "./Error";
import {ResponseError, ResponseErrorType} from "../../api/client";

export default function TokenPage() {
  const {tokenId} = useParams();
  const {data, isLoading, error} = useGetTokenData(tokenId);

  if (isLoading) {
    return (
      <Grid container spacing={1}>
        <PageHeader />
        <Grid size={{xs: 12}}>
          <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
            <CircularProgress />
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    // Convert Error to ResponseError if needed
    let responseError: ResponseError;
    if (error && typeof error === "object" && "type" in error) {
      responseError = error as ResponseError;
    } else {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      responseError = {
        type: ResponseErrorType.UNHANDLED,
        message: errorMessage,
      };
    }
    return (
      <Grid container spacing={1}>
        <PageHeader />
        <Grid size={{xs: 12}}>
          <TokenError error={responseError} tokenId={tokenId} />
        </Grid>
      </Grid>
    );
  }

  if (!data) {
    return (
      <Grid container spacing={1}>
        <PageHeader />
        <Grid size={{xs: 12}}>
          <EmptyTabContent />
        </Grid>
      </Grid>
    );
  }

  const tokenDatas = data ?? [];
  if (tokenDatas.length === 0) {
    return (
      <Grid container spacing={1}>
        <PageHeader />
        <Grid size={{xs: 12}}>
          <EmptyTabContent />
        </Grid>
      </Grid>
    );
  }
  const token = tokenDatas[0];

  return (
    <Grid container spacing={1}>
      <PageHeader />
      <Grid size={{xs: 12}}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TokenTitle
            name={token?.token_name ?? ""}
            tokenDataId={token?.token_data_id ?? ""}
            tokenCollection={token?.collection_id ?? ""}
          />
          <TokenTabs data={token} />
        </Stack>
      </Grid>
    </Grid>
  );
}
