import React, {useState} from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
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
import {CoinData} from "../Components/CoinData";
import {Box, CircularProgress, Pagination} from "@mui/material";

type TransactionsTabProps = {
  struct: string;
  data: CoinData | undefined;
};

const LIMIT = 25;

export default function TransactionsTab({struct, data}: TransactionsTabProps) {
  const [page, setPage] = useState(1);
  const [prevStruct, setPrevStruct] = useState(struct);

  // Reset page when struct changes (during render, per React best practices)
  if (struct !== prevStruct) {
    setPrevStruct(struct);
    setPage(1);
  }

  const offset = (page - 1) * LIMIT;
  const activityData = useGetCoinActivities(struct, LIMIT, offset);

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
  data: CoinData;
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
