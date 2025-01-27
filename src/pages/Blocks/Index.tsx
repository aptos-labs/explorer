import * as React from "react";
import BlocksTable from "./Table";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {Box, Typography} from "@mui/material";
import PageHeader from "../layout/PageHeader";
import LoadingModal from "../../components/LoadingModal";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {useSearchParams} from "react-router-dom";

const BLOCKS_COUNT = 30;

export default function BlocksPage() {
  const [params] = useSearchParams();
  const start = params.get("start");
  const actualStart = start ? start : undefined;
  const {recentBlocks, isLoading} = useGetMostRecentBlocks(
    actualStart,
    BLOCKS_COUNT,
  );

  usePageMetadata({title: "Latest Blocks"});

  return (
    <>
      <LoadingModal open={isLoading} />
      <Box>
        <PageHeader />
        <Typography variant="h3" marginBottom={2}>
          Latest Blocks
        </Typography>
        <BlocksTable blocks={recentBlocks} />
      </Box>
    </>
  );
}
