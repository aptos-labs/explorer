import {Box, Typography} from "@mui/material";
import {useGetMostRecentBlocks} from "../../api/hooks/useGetMostRecentBlocks";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import LoadingModal from "../../components/LoadingModal";
import {useTranslation} from "../../i18n";
import {useNavigate, useSearchParams} from "../../routing";
import PageHeader from "../layout/PageHeader";
import BlockRangeControls from "./BlockRangeControls";
import {
  type BlockListQuery,
  type BlockRangeShift,
  blockListSearchParams,
  parseBlockListQuery,
  shiftBlockListQuery,
  windowForQuery,
} from "./blockRange";
import BlocksTable from "./Table";

export default function BlocksPage() {
  const {t} = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = parseBlockListQuery({
    start: params.get("start"),
    end: params.get("end"),
  });
  const frozenWindow =
    query.kind === "live" ? undefined : windowForQuery(query, undefined);
  const newestHeight = frozenWindow?.end;
  const requestedCount = frozenWindow
    ? frozenWindow.end - frozenWindow.start + 1
    : query.pageSize;

  const {recentBlocks, isLoading, ledgerBlockHeight} = useGetMostRecentBlocks(
    newestHeight,
    requestedCount,
  );
  const displayed = windowForQuery(query, ledgerBlockHeight);

  const go = (direction: BlockRangeShift) => {
    if (!displayed) return;
    const next = shiftBlockListQuery(displayed, direction, ledgerBlockHeight);
    if (!next) return;
    applyBlockListQuery(params, navigate, next);
    window.scrollTo({top: 0});
  };

  const olderDisabled = !displayed || displayed.start <= 0;
  const newerDisabled =
    !displayed ||
    ledgerBlockHeight === undefined ||
    displayed.end >= ledgerBlockHeight;

  const renderControls = () => (
    <BlockRangeControls
      range={displayed}
      olderDisabled={olderDisabled}
      newerDisabled={newerDisabled}
      onOlder={() => go("older")}
      onNewer={() => go("newer")}
    />
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
        {renderControls()}
        <BlocksTable blocks={recentBlocks} />
        {renderControls()}
      </Box>
    </>
  );
}

function applyBlockListQuery(
  params: URLSearchParams,
  navigate: (options: {
    to: string;
    search: Record<string, string | number>;
  }) => void,
  query: BlockListQuery,
) {
  const range = blockListSearchParams(query);
  // Heights are numbers on purpose. TanStack Router JSON-quotes numeric
  // strings (`start=%22100%22`), and plain numbers stay `?start=100&end=119`.
  const search: Record<string, string | number> = {};
  params.forEach((value, key) => {
    if (key === "start" || key === "end") return;
    search[key] = value;
  });
  if (range.start !== undefined && range.end !== undefined) {
    search.start = Number(range.start);
    search.end = Number(range.end);
  }
  navigate({to: "/blocks", search});
}
