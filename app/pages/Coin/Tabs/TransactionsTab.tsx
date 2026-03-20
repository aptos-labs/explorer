import ClearIcon from "@mui/icons-material/Clear";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type React from "react";
import {useCallback, useState} from "react";
import {
  type ActivityTypeFilter,
  type FAActivity,
  useGetCoinActivitiesByOwnerCursor,
  useGetCoinActivitiesCursor,
} from "../../../api/hooks/useGetCoinActivities";
import HashButton, {HashType} from "../../../components/HashButton";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import {useSearchParams} from "../../../routing";
import type {CoinData} from "../Components/CoinData";

type TransactionsTabProps = {
  struct: string;
  data: CoinData | undefined;
  pairedFa: string | null;
};

const LIMIT = 25;

function getActivityLabel(type: string): string {
  if (type.includes("GasFeeEvent")) return "Gas Fee";
  if (type.includes("Deposit")) return "Deposit";
  if (type.includes("Withdraw")) return "Withdraw";
  if (type.includes("Mint")) return "Mint";
  if (type.includes("Burn")) return "Burn";
  if (type.includes("Freeze")) return "Freeze";
  if (type.includes("Transfer")) return "Transfer";
  const parts = type.split("::");
  return parts.length > 0 ? parts[parts.length - 1] : type;
}

function getActivityColor(
  type: string,
): "default" | "success" | "error" | "info" | "warning" {
  if (type.includes("Mint")) return "success";
  if (type.includes("Burn")) return "error";
  if (type.includes("Deposit")) return "info";
  if (type.includes("Withdraw")) return "warning";
  return "default";
}

function matchesFilter(activity: FAActivity, filter: ActivityTypeFilter) {
  if (filter === "all") return true;
  const t = activity.type.toLowerCase();
  switch (filter) {
    case "deposit":
      return t.includes("deposit");
    case "withdraw":
      return t.includes("withdraw");
    case "mint":
      return t.includes("mint");
    case "burn":
      return t.includes("burn");
  }
}

function OwnerFilterInput({
  owner,
  onOwnerChange,
}: {
  owner: string;
  onOwnerChange: (owner: string) => void;
}) {
  const [inputValue, setInputValue] = useState(owner);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOwnerChange(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue("");
    onOwnerChange("");
  };

  return (
    <Stack spacing={1} sx={{mb: 2}}>
      <form onSubmit={handleSubmit}>
        <TextField
          size="small"
          fullWidth
          placeholder="Filter by owner address (e.g. 0x1a2b...)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          slotProps={{
            input: {
              endAdornment: inputValue ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear owner filter"
                    onClick={handleClear}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {fontFamily: "monospace", fontSize: "0.875rem"},
            },
          }}
        />
      </form>
      {owner && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Filtered by owner:
          </Typography>
          <Chip
            label={
              <HashButton hash={owner} type={HashType.ACCOUNT} size="small" />
            }
            onDelete={handleClear}
            size="small"
            variant="outlined"
          />
        </Stack>
      )}
    </Stack>
  );
}

function FilteredByOwnerContent({
  asset,
  owner,
}: {
  asset: string;
  owner: string;
}) {
  const [cursorStack, setCursorStack] = useState<number[]>([]);
  const [filter, setFilter] = useState<ActivityTypeFilter>("all");
  const [prevKey, setPrevKey] = useState(`${asset}-${owner}`);

  const key = `${asset}-${owner}`;
  if (key !== prevKey) {
    setPrevKey(key);
    setCursorStack([]);
    setFilter("all");
  }

  const cursor =
    cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;
  const activityData = useGetCoinActivitiesByOwnerCursor(
    asset,
    owner,
    LIMIT,
    cursor,
  );

  const handleNextPage = useCallback(() => {
    if (activityData.data && activityData.data.length > 0) {
      const lastVersion =
        activityData.data[activityData.data.length - 1].transaction_version;
      setCursorStack((prev) => [...prev, lastVersion]);
    }
  }, [activityData.data]);

  const handlePrevPage = useCallback(() => {
    setCursorStack((prev) => prev.slice(0, -1));
  }, []);

  const handleFilterChange = useCallback((event: SelectChangeEvent) => {
    setFilter(event.target.value as ActivityTypeFilter);
  }, []);

  if (activityData?.isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (activityData?.error) {
    return (
      <Alert severity="error">
        Failed to load transactions. The owner address may be invalid or the
        indexer may be temporarily unavailable.
      </Alert>
    );
  }

  if (!activityData?.data || activityData.data.length === 0) {
    return (
      <Box sx={{py: 4, textAlign: "center"}}>
        <Typography color="text.secondary">
          No transactions found for this coin and owner
        </Typography>
      </Box>
    );
  }

  const filteredActivities = activityData.data.filter((a) =>
    matchesFilter(a, filter),
  );
  const isFirstPage = cursorStack.length === 0;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{px: 2, py: 1}}
      >
        <FormControl size="small" sx={{minWidth: 140}}>
          <InputLabel id="owner-activity-filter-label">
            Activity Type
          </InputLabel>
          <Select
            labelId="owner-activity-filter-label"
            value={filter}
            label="Activity Type"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdraw">Withdraw</MenuItem>
            <MenuItem value="mint">Mint</MenuItem>
            <MenuItem value="burn">Burn</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {filteredActivities.length === 0 ? (
        <EmptyTabContent />
      ) : (
        <FAActivityTable activities={filteredActivities} />
      )}
      <Stack
        direction="row"
        justifyContent="center"
        spacing={2}
        sx={{padding: 2}}
      >
        <Button
          variant="outlined"
          onClick={handlePrevPage}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={!activityData.hasNextPage}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

function AllTransactionsContent({asset}: {asset: string}) {
  const [cursorStack, setCursorStack] = useState<number[]>([]);
  const [filter, setFilter] = useState<ActivityTypeFilter>("all");
  const [prevAsset, setPrevAsset] = useState(asset);

  if (asset !== prevAsset) {
    setPrevAsset(asset);
    setCursorStack([]);
    setFilter("all");
  }

  const cursor =
    cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;
  const activityData = useGetCoinActivitiesCursor(asset, LIMIT, cursor);

  const handleNextPage = useCallback(() => {
    if (activityData.data && activityData.data.length > 0) {
      const lastVersion =
        activityData.data[activityData.data.length - 1].transaction_version;
      setCursorStack((prev) => [...prev, lastVersion]);
    }
  }, [activityData.data]);

  const handlePrevPage = useCallback(() => {
    setCursorStack((prev) => prev.slice(0, -1));
  }, []);

  const handleFilterChange = useCallback((event: SelectChangeEvent) => {
    setFilter(event.target.value as ActivityTypeFilter);
  }, []);

  if (activityData?.isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activityData?.data || activityData.data.length === 0) {
    return <EmptyTabContent />;
  }

  const filteredActivities = activityData.data.filter((a) =>
    matchesFilter(a, filter),
  );
  const isFirstPage = cursorStack.length === 0;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{px: 2, py: 1}}
      >
        <FormControl size="small" sx={{minWidth: 140}}>
          <InputLabel id="activity-filter-label">Activity Type</InputLabel>
          <Select
            labelId="activity-filter-label"
            value={filter}
            label="Activity Type"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdraw">Withdraw</MenuItem>
            <MenuItem value="mint">Mint</MenuItem>
            <MenuItem value="burn">Burn</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {filteredActivities.length === 0 ? (
        <EmptyTabContent />
      ) : (
        <FAActivityTable activities={filteredActivities} />
      )}
      <Stack
        direction="row"
        justifyContent="center"
        spacing={2}
        sx={{padding: 2}}
      >
        <Button
          variant="outlined"
          onClick={handlePrevPage}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={!activityData.hasNextPage}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

export default function TransactionsTab({
  struct,
  data,
  pairedFa,
}: TransactionsTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerParam = searchParams.get("owner") ?? "";

  const handleOwnerChange = (newOwner: string) => {
    if (newOwner) {
      searchParams.set("owner", newOwner);
    } else {
      searchParams.delete("owner");
    }
    setSearchParams(searchParams, {replace: true});
  };

  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  const asset = pairedFa ?? struct;

  return (
    <Box>
      <OwnerFilterInput owner={ownerParam} onOwnerChange={handleOwnerChange} />
      {ownerParam ? (
        <FilteredByOwnerContent asset={asset} owner={ownerParam} />
      ) : (
        <AllTransactionsContent asset={asset} />
      )}
    </Box>
  );
}

export function FAActivityTable({activities}: {activities: FAActivity[]}) {
  return (
    <Table aria-label="Coin transactions" data-entity-type="transaction">
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="version" />
          <GeneralTableHeaderCell header="type" />
          <GeneralTableHeaderCell header="account" />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {activities.map((activity) => {
          return (
            <GeneralTableRow
              key={`${activity.transaction_version}-${activity.event_index}`}
            >
              <GeneralTableCell>
                <HashButton
                  hash={activity.transaction_version.toString()}
                  type={HashType.TRANSACTION}
                />
              </GeneralTableCell>
              <GeneralTableCell>
                <Chip
                  label={getActivityLabel(activity.type)}
                  color={getActivityColor(activity.type)}
                  size="small"
                  variant="outlined"
                />
              </GeneralTableCell>
              <GeneralTableCell>
                <HashButton
                  hash={activity.owner_address}
                  type={HashType.ACCOUNT}
                />
              </GeneralTableCell>
            </GeneralTableRow>
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
