import {Box, CircularProgress, Grid, Stack} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import {useGetTokenData} from "../../api/hooks/useGetAccountTokens";
import EmptyTabContent from "../../components/IndividualPageContent/EmptyTabContent";
import PageHeader from "../layout/PageHeader";
import TokenError from "./Error";
import TokenTabs from "./Tabs";
import TokenTitle from "./Title";

export default function TokenPage() {
  const params = useParams({strict: false}) as {
    tokenId?: string;
    tab?: string;
  };
  const tokenId = params?.tokenId ?? "";
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
            tokenCollection={token?.collection_id ?? ""}
            urlTokenId={tokenId}
            pathTab={params.tab}
          />
          <TokenTabs data={token} />
        </Stack>
      </Grid>
    </Grid>
  );
}
