import * as React from "react";
import BlocksTable from "./Table";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {Box, Typography} from "@mui/material";
import PageHeader from "../layout/PageHeader";
import LoadingModal from "../../components/LoadingModal";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {useSearchParams} from "../../routing";

const BLOCKS_COUNT = 30;

export default function BlocksPage() {
  const [params] = useSearchParams();
  const start = params.get("start");
  const actualStart = start ? start : undefined;
  const {recentBlocks, isLoading} = useGetMostRecentBlocks(
    actualStart,
    BLOCKS_COUNT,
  );

  return (
    <>
      <PageMetadata
        title="Latest Blocks"
        description="View the latest blocks produced on the Aptos blockchain. Monitor block height, epoch, round, timestamps, proposers, and included transactions. Real-time block explorer."
        type="block"
        keywords={[
          "blocks",
          "block height",
          "proposer",
          "epoch",
          "blockchain",
          "real-time",
        ]}
        canonicalPath="/blocks"
      />
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
