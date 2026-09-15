import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {useCallback, useState} from "react";
import {englishT, useTranslation, type TFunction} from "../../../i18n";
import {
  type ActivityTypeFilter,
  type FAActivity,
  useGetCoinActivitiesCursor,
} from "../../../api/hooks/useGetCoinActivities";
import HashButton, {HashType} from "../../../components/HashButton";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import type {FACombinedData} from "../Index";

type TransactionsTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

const LIMIT = 25;

function getActivityLabel(type: string, t: TFunction = englishT): string {
  if (type.includes("GasFeeEvent")) return t("activity.gasFee");
  if (type.includes("Deposit")) return t("activity.deposit");
  if (type.includes("Withdraw")) return t("activity.withdraw");
  if (type.includes("Mint")) return t("activity.mint");
  if (type.includes("Burn")) return t("activity.burn");
  if (type.includes("Freeze")) return t("activity.freeze");
  if (type.includes("Transfer")) return t("activity.transfer");
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

export default function TransactionsTab({address, data}: TransactionsTabProps) {
  const {t} = useTranslation();
  const [cursorStack, setCursorStack] = useState<number[]>([]);
  const [filter, setFilter] = useState<ActivityTypeFilter>("all");
  const [prevAddress, setPrevAddress] = useState(address);

  if (address !== prevAddress) {
    setPrevAddress(address);
    setCursorStack([]);
    setFilter("all");
  }

  const cursor =
    cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;
  const activityData = useGetCoinActivitiesCursor(address, LIMIT, cursor);

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
  if (!data || Array.isArray(data) || !activityData?.data) {
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
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
        }}
      >
        <FormControl size="small" sx={{minWidth: 140}}>
          <InputLabel id="fa-activity-filter-label">
            {t("activity.type")}
          </InputLabel>
          <Select
            labelId="fa-activity-filter-label"
            value={filter}
            label={t("activity.type")}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">{t("activity.all")}</MenuItem>
            <MenuItem value="deposit">{t("activity.deposit")}</MenuItem>
            <MenuItem value="withdraw">{t("activity.withdraw")}</MenuItem>
            <MenuItem value="mint">{t("activity.mint")}</MenuItem>
            <MenuItem value="burn">{t("activity.burn")}</MenuItem>
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
        spacing={2}
        sx={{
          justifyContent: "center",
          padding: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePrevPage}
          disabled={isFirstPage}
        >
          {t("common.previous")}
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={!activityData.hasNextPage}
        >
          {t("common.next")}
        </Button>
      </Stack>
    </Box>
  );
}

export function FAActivityTable({activities}: {activities: FAActivity[]}) {
  const {t} = useTranslation();
  return (
    <Table
      aria-label={t("common.assetTransactionsAria")}
      data-entity-type="transaction"
    >
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
                  label={getActivityLabel(activity.type, t)}
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
