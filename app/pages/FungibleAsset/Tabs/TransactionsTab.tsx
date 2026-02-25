import {Box, CircularProgress, Pagination} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type React from "react";
import {useState} from "react";
import {
  type FAActivity,
  useGetCoinActivities,
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

export default function TransactionsTab({address, data}: TransactionsTabProps) {
  const [page, setPage] = useState(1);
  const [prevAddress, setPrevAddress] = useState(address);

  // Reset page when address changes (during render, per React best practices)
  if (address !== prevAddress) {
    setPrevAddress(address);
    setPage(1);
  }

  const offset = (page - 1) * LIMIT;
  const activityData = useGetCoinActivities(address, LIMIT, offset);

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

  const pageCount = activityData.count
    ? Math.ceil(activityData.count / LIMIT)
    : 0;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box>
      <FAActivityTable data={data} activities={activityData.data} />
      {pageCount > 1 && (
        <Box sx={{display: "flex", justifyContent: "center", padding: 2}}>
          <Pagination count={pageCount} page={page} onChange={handleChange} />
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
    <Table aria-label="Asset transactions" data-entity-type="transaction">
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
