import React, {useState, useCallback} from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {FACombinedData} from "../Index";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {
  FAActivity,
  useGetCoinActivities,
} from "../../../api/hooks/useGetCoinActivities";
import {Box, Button, CircularProgress} from "@mui/material";

type TransactionsTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

const LIMIT = 25;

export default function TransactionsTab({address, data}: TransactionsTabProps) {
  // Store accumulated activities for "Load More" pattern
  const [allActivities, setAllActivities] = useState<FAActivity[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [prevAddress, setPrevAddress] = useState(address);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset state when address changes (during render, per React best practices)
  if (address !== prevAddress) {
    setPrevAddress(address);
    setAllActivities([]);
    setCursor(undefined);
    setIsLoadingMore(false);
  }

  const activityData = useGetCoinActivities(address, LIMIT, cursor);

  // Merge new data with existing data when load completes
  React.useEffect(() => {
    if (activityData.data && !activityData.isLoading) {
      if (cursor === undefined) {
        // Initial load - replace all activities
        setAllActivities(activityData.data);
      } else if (isLoadingMore) {
        // Load more - append new activities
        setAllActivities((prev) => {
          // Deduplicate by transaction_version
          const existingVersions = new Set(
            prev.map((a) => a.transaction_version),
          );
          const newActivities = activityData.data!.filter(
            (a) => !existingVersions.has(a.transaction_version),
          );
          return [...prev, ...newActivities];
        });
        setIsLoadingMore(false);
      }
    }
  }, [activityData.data, activityData.isLoading, cursor, isLoadingMore]);

  const handleLoadMore = useCallback(() => {
    if (allActivities.length > 0) {
      const lastActivity = allActivities[allActivities.length - 1];
      setIsLoadingMore(true);
      setCursor(lastActivity.transaction_version);
    }
  }, [allActivities]);

  // Show loading only on initial load
  if (activityData.isLoading && allActivities.length === 0) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || Array.isArray(data) || allActivities.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <Box>
      <FAActivityTable data={data} activities={allActivities} />
      {activityData.hasMore && (
        <Box sx={{display: "flex", justifyContent: "center", padding: 2}}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={isLoadingMore || activityData.isLoading}
          >
            {isLoadingMore || activityData.isLoading
              ? "Loading..."
              : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function FAActivityTable({
  activities,
}: {
  activities: FAActivity[];
  data: FACombinedData;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="version" />
          <GeneralTableHeaderCell header="sender" />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {activities.map((activity) => {
          return (
            <GeneralTableRow key={activity.transaction_version}>
              <GeneralTableCell>
                <HashButton
                  hash={activity.transaction_version.toString()}
                  type={HashType.TRANSACTION}
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
