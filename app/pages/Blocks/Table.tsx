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
import {useMemo, useSyncExternalStore} from "react";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../components/HashButton";
import IntegerValue from "../../components/IndividualPageContent/ContentValue/IntegerValue";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import VirtualizedTableBody from "../../components/Table/VirtualizedTableBody";
import {englishT, useTranslation, type TFunction} from "../../i18n";
import {
  Link,
  useAugmentToWithGlobalSearchParams,
  useNavigate,
} from "../../routing";
import {assertNever} from "../../utils";
import {getTimeDiffInSeconds, parseTimestamp} from "../utils";

// Module-level clock store. The interval is started on the first subscriber and
// stopped when the last subscriber unsubscribes, so BlocksTable itself never
// needs to hold clock state – only the age cells re-render every second.
let _nowSnapshot = new Date();
const _clockListeners = new Set<() => void>();
let _clockIntervalId: ReturnType<typeof setInterval> | null = null;

function _subscribeToNow(onStoreChange: () => void) {
  _clockListeners.add(onStoreChange);
  if (_clockListeners.size === 1) {
    _clockIntervalId = setInterval(() => {
      _nowSnapshot = new Date();
      for (const l of _clockListeners) l();
    }, 1000);
  }
  return () => {
    _clockListeners.delete(onStoreChange);
    if (_clockListeners.size === 0 && _clockIntervalId !== null) {
      clearInterval(_clockIntervalId);
      _clockIntervalId = null;
    }
  };
}

const _getNowSnapshot = () => _nowSnapshot;
// On the server there is no live clock; return epoch so SSR output is stable
// and hydration never mismatches the client's first snapshot.
const _getServerNowSnapshot = () => new Date(0);

function useNow(): Date {
  return useSyncExternalStore(
    _subscribeToNow,
    _getNowSnapshot,
    _getServerNowSnapshot,
  );
}

function formatAge(
  seconds: number,
  t: TFunction = englishT,
  formatInteger: (value: number) => string = (value) => String(value),
): string {
  if (seconds < 60) {
    return t("common.secondsAgo", {count: formatInteger(seconds)});
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return t("common.minutesAgo", {count: formatInteger(mins)});
  } else if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600);
    return t("common.hoursAgo", {count: formatInteger(hrs)});
  } else {
    const days = Math.floor(seconds / 86400);
    return t("common.daysAgo", {count: formatInteger(days)});
  }
}

function calcAge(
  blockTimestamp: Date,
  now: Date,
  t: TFunction = englishT,
  formatInteger: (value: number) => string = (value) => String(value),
): string {
  const durationInSec = Math.max(
    0,
    Math.floor(getTimeDiffInSeconds(blockTimestamp, now)),
  );
  return formatAge(durationInSec, t, formatInteger);
}

type BlockCellProps = {
  block: Types.Block;
};

function BlockHeightCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link to={`/block/${block.block_height}`} underline="none">
        <IntegerValue value={block.block_height} />
      </Link>
    </GeneralTableCell>
  );
}

function BlockAgeCell({block}: BlockCellProps) {
  const {t, formatInteger} = useTranslation();
  const now = useNow();
  const blockTimestamp = useMemo(
    () => parseTimestamp(block.block_timestamp),
    [block.block_timestamp],
  );
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {calcAge(blockTimestamp, now, t, formatInteger)}
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
      <IntegerValue
        value={(
          BigInt(block.last_version) -
          BigInt(block.first_version) +
          BigInt(1)
        ).toString()}
      />
    </GeneralTableCell>
  );
}

function FirstVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Link to={`/txn/${block.first_version}`} underline="none">
        <IntegerValue value={block.first_version} />
      </Link>
    </GeneralTableCell>
  );
}

function LastVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Link to={`/txn/${block.last_version}`} underline="none">
        <IntegerValue value={block.last_version} />
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
  const {t, formatInteger, formatIntegerString} = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();
  const now = useNow();
  const blockTimestamp = useMemo(
    () => parseTimestamp(block.block_timestamp),
    [block.block_timestamp],
  );
  const age = calcAge(blockTimestamp, now, t, formatInteger);

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
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{fontWeight: 600, fontSize: "0.95rem", color: "primary.main"}}
        >
          {t("table.blockHeight", {
            height: formatIntegerString(block.block_height),
          })}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
          }}
        >
          {age}
        </Typography>
      </Stack>
      {/* Row 2: Hash */}
      <Box sx={{mb: 1.5}}>
        <Typography
          variant="caption"
          sx={{color: "text.secondary", display: "block"}}
        >
          {t("table.hashCol")}
        </Typography>
        <HashButton hash={block.block_hash} type={HashType.OTHERS} />
      </Box>
      {/* Row 3: Stats */}
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            {t("common.transactions")}
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            <IntegerValue value={numTransactions} />
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            {t("table.firstVersion")}
          </Typography>
          <Typography
            sx={{fontSize: "0.85rem", fontWeight: 500, color: "primary.main"}}
          >
            {formatIntegerString(block.first_version)}
          </Typography>
        </Box>
        <Box sx={{textAlign: "right"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            {t("table.lastVersion")}
          </Typography>
          <Typography
            sx={{fontSize: "0.85rem", fontWeight: 500, color: "primary.main"}}
          >
            {formatIntegerString(block.last_version)}
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
      return <GeneralTableHeaderCell headerKey="table.block" />;
    case "age":
      return <GeneralTableHeaderCell headerKey="table.age" />;
    case "hash":
      return <GeneralTableHeaderCell headerKey="table.hashCol" />;
    case "numVersions":
      return (
        <GeneralTableHeaderCell
          headerKey="table.numTransactions"
          textAlignRight
        />
      );
    case "firstVersion":
      return (
        <GeneralTableHeaderCell headerKey="table.firstVersion" textAlignRight />
      );
    case "lastVersion":
      return (
        <GeneralTableHeaderCell headerKey="table.lastVersion" textAlignRight />
      );
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
  const {t} = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      <Box>
        {blocks.map((block: Types.Block) => (
          <BlockCard key={block.block_height} block={block} />
        ))}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box sx={{overflowX: "auto"}}>
      <Table aria-label={t("common.blocksAria")} data-entity-type="block">
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
  );
}
