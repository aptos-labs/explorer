import {Box, Typography} from "@mui/material";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import LoadingModal from "../../components/LoadingModal";
import {useTranslation} from "../../i18n";
import {useSearchParams} from "../../routing";
import PageHeader from "../layout/PageHeader";
import BlocksTable from "./Table";

/** Matches typical blocks-page load (10–20 REST calls per refresh). */
const BLOCKS_COUNT = 20;

export default function BlocksPage() {
  const {t} = useTranslation();
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
        title={t("pages.blocks.title")}
        description={t("pages.blocks.listDescription")}
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
        <Typography
          variant="h3"
          component="h1"
          sx={{
            marginBottom: 2,
          }}
        >
          {t("pages.blocks.title")}
        </Typography>
        <BlocksTable blocks={recentBlocks} />
      </Box>
    </>
  );
}
