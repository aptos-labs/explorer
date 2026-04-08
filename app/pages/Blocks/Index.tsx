import {Box, Typography} from "@mui/material";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import LoadingModal from "../../components/LoadingModal";
import {useSearchParams} from "../../routing";
import PageHeader from "../layout/PageHeader";
import BlocksTable from "./Table";

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
        type="website"
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
        <Typography variant="h3" component="h1" sx={{marginBottom: 2}}>
          Latest Blocks
        </Typography>
        <BlocksTable blocks={recentBlocks} />
      </Box>
    </>
  );
}
