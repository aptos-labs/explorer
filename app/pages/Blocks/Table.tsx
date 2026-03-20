import {
  Box,
  Paper,
  Stack,
  Table,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import * as React from "react";
import {useContext, useEffect, useMemo, useState} from "react";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../components/HashButton";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import VirtualizedTableBody from "../../components/Table/VirtualizedTableBody";
import {
  Link,
  useAugmentToWithGlobalSearchParams,
  useNavigate,
} from "../../routing";
import {assertNever} from "../../utils";
import {getTimeDiffInSeconds, parseTimestamp} from "../utils";

// Single shared clock so all age cells re-render from one interval, not N.
const NowContext = React.createContext<Date>(new Date());

function formatAge(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}min ago`;
  } else if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600);
    return `${hrs}h ago`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }
}

function blockAge(block: Types.Block, now: Date): string {
  const blockTimestamp = parseTimestamp(block.block_timestamp);
  const durationInSec = Math.max(
    0,
    Math.floor(getTimeDiffInSeconds(blockTimestamp, now)),
  );
  return formatAge(durationInSec);
}

type BlockCellProps = {
  block: Types.Block;
};

function BlockHeightCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link to={`/block/${block.block_height}`} underline="none">
        {block.block_height}
      </Link>
    </GeneralTableCell>
  );
}

function BlockAgeCell({block}: BlockCellProps) {
  const now = useContext(NowContext);
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {blockAge(block, now)}
    </GeneralTableCell>
  );
}

function BlockHashCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={block.block_hash} type={HashType.OTHERS} />
    </GeneralTableCell>
  );
}

function CountVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {(
        BigInt(block.last_version) -
        BigInt(block.first_version) +
        BigInt(1)
      ).toString()}
    </GeneralTableCell>
  );
}

function FirstVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Link to={`/txn/${block.first_version}`} underline="none">
        {block.first_version}
      </Link>
    </GeneralTableCell>
  );
}

function LastVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Link to={`/txn/${block.last_version}`} underline="none">
        {block.last_version}
      </Link>
    </GeneralTableCell>
  );
}

const BlockCells = Object.freeze({
  height: BlockHeightCell,
  age: BlockAgeCell,
  hash: BlockHashCell,
  numVersions: CountVersionCell,
  firstVersion: FirstVersionCell,
  lastVersion: LastVersionCell,
});

type Column = keyof typeof BlockCells;

const DEFAULT_COLUMNS: Column[] = [
  "height",
  "age",
  "hash",
  "numVersions",
  "firstVersion",
  "lastVersion",
];

type BlockRowProps = {
  block: Types.Block;
  columns: Column[];
};

const BlockRow = React.memo(function BlockRow({block, columns}: BlockRowProps) {
  const augmentTo = useAugmentToWithGlobalSearchParams();

  return (
    <GeneralTableRow to={augmentTo(`/block/${block.block_height}`)}>
      {columns.map((column) => {
        const Cell = BlockCells[column];
        return <Cell key={column} block={block} />;
      })}
    </GeneralTableRow>
  );
});

// Mobile card component for blocks
type BlockCardProps = {
  block: Types.Block;
};

const BlockCard = React.memo(function BlockCard({block}: BlockCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();
  const now = useContext(NowContext);
  const age = blockAge(block, now);

  const numTransactions = (
    BigInt(block.last_version) -
    BigInt(block.first_version) +
    BigInt(1)
  ).toString();

  const handleClick = () => {
    navigate({to: augmentTo(`/block/${block.block_height}`)});
  };

  return (
    <Paper
      onClick={handleClick}
      sx={{
        px: 2,
        py: 1.5,
        mb: 1,
        cursor: "pointer",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        "&:hover": {
          filter:
            theme.palette.mode === "dark"
              ? "brightness(0.9)"
              : "brightness(0.99)",
        },
        "&:active": {
          background: theme.palette.neutralShade.main,
          transform: "translate(0,0.1rem)",
        },
      }}
    >
      {/* Row 1: Block height and Age */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mb: 1}}
      >
        <Typography
          sx={{fontWeight: 600, fontSize: "0.95rem", color: "primary.main"}}
        >
          Block {block.block_height}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {age}
        </Typography>
      </Stack>

      {/* Row 2: Hash */}
      <Box sx={{mb: 1.5}}>
        <Typography
          variant="caption"
          sx={{color: "text.secondary", display: "block"}}
        >
          Hash
        </Typography>
        <HashButton hash={block.block_hash} type={HashType.OTHERS} />
      </Box>

      {/* Row 3: Stats */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Transactions
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {numTransactions}
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            First Version
          </Typography>
          <Typography
            sx={{fontSize: "0.85rem", fontWeight: 500, color: "primary.main"}}
          >
            {block.first_version}
          </Typography>
        </Box>
        <Box sx={{textAlign: "right"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Last Version
          </Typography>
          <Typography
            sx={{fontSize: "0.85rem", fontWeight: 500, color: "primary.main"}}
          >
            {block.last_version}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
});

type BlockHeaderCellProps = {
  column: Column;
};

function BlockHeaderCell({column}: BlockHeaderCellProps) {
  switch (column) {
    case "height":
      return <GeneralTableHeaderCell header="Block" />;
    case "age":
      return <GeneralTableHeaderCell header="Age" />;
    case "hash":
      return <GeneralTableHeaderCell header="Hash" />;
    case "numVersions":
      return (
        <GeneralTableHeaderCell header="Num Transactions" textAlignRight />
      );
    case "firstVersion":
      return <GeneralTableHeaderCell header="First Version" textAlignRight />;
    case "lastVersion":
      return <GeneralTableHeaderCell header="Last Version" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type BlocksTableProps = {
  blocks: Types.Block[];
  columns?: Column[];
};

export default function BlocksTable({
  blocks,
  columns = DEFAULT_COLUMNS,
}: BlocksTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Single 1-second timer shared by all age cells via NowContext.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // TODO: Fix this better than this change here, this seems to be a bug elsewhere that I'm trying to fix on first load of page
  if (blocks == null) {
    blocks = [];
  } else if (!Array.isArray(blocks)) {
    blocks = [blocks];
  }

  // Memoize block rows for virtualization
  const blockRows = useMemo(
    () =>
      blocks.map((block: Types.Block) => (
        <BlockRow key={block.block_height} block={block} columns={columns} />
      )),
    [blocks, columns],
  );

  // Mobile card view
  if (isMobile) {
    return (
      <NowContext.Provider value={now}>
        <Box>
          {blocks.map((block: Types.Block) => (
            <BlockCard key={block.block_height} block={block} />
          ))}
        </Box>
      </NowContext.Provider>
    );
  }

  // Desktop table view
  return (
    <NowContext.Provider value={now}>
      <Box sx={{overflowX: "auto"}}>
        <Table aria-label="Blocks" data-entity-type="block">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <BlockHeaderCell key={column} column={column} />
              ))}
            </TableRow>
          </TableHead>
          <VirtualizedTableBody
            estimatedRowHeight={65}
            virtualizationThreshold={15}
          >
            {blockRows}
          </VirtualizedTableBody>
        </Table>
      </Box>
    </NowContext.Provider>
  );
}
