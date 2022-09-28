import * as React from "react";
import BlocksTable from "./Table";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {Box, Typography} from "@mui/material";
import LoadingModal from "../Governance/components/LoadingModal";

const BLOCKS_COUNT = 30;

export function BlocksPage() {
  const {recentBlocks, isLoading} = useGetMostRecentBlocks(BLOCKS_COUNT);

  return (
    <>
      <LoadingModal open={isLoading} />
      <Box>
        <Typography variant="h5" marginBottom={2}>
          Recent Blocks
        </Typography>
        <BlocksTable blocks={recentBlocks} />
      </Box>
    </>
  );
}
