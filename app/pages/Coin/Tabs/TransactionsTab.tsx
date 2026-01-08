import React from "react";
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
import {Box, CircularProgress} from "@mui/material";

type TransactionsTabProps = {
  struct: string;
  data: CoinData | undefined;
};

export default function TransactionsTab({struct, data}: TransactionsTabProps) {
  const holderData = useGetCoinActivities(struct);
  if (holderData?.isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
        <CircularProgress />
      </Box>
    );
  }
  if (!data || Array.isArray(data) || !holderData?.data) {
    return <EmptyTabContent />;
  }

  return <FAActivityTable data={data} activities={holderData.data} />;
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
            <GeneralTableRow>
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
