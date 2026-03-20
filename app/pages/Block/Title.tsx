import {Stack, Typography} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {getBlockTabHeadLabel} from "./blockTabMeta";

type BlockTitleProps = {
  height: number;
  /** Path segment from `/block/:height/:tab` */
  pathTab?: string;
};

export default function BlockTitle({height, pathTab}: BlockTitleProps) {
  const tab = pathTab ?? "overview";
  const tabHead = getBlockTabHeadLabel(pathTab);
  const heightLabel = height.toLocaleString();
  const metadataTitle = `${tabHead} | Block ${heightLabel}`;
  const metadataDescription = `View ${tabHead.toLowerCase()} for block ${heightLabel} on the Aptos blockchain.`;

  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <PageMetadata
        title={metadataTitle}
        description={metadataDescription}
        type="block"
        keywords={["block", "height", `block ${height}`, "proposer", "epoch"]}
        canonicalPath={`/block/${height}/${tab}`}
      />
      <Typography variant="h3" component="h1">
        Block
      </Typography>
    </Stack>
  );
}
