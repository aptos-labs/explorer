import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type React from "react";
import {
  type AccountCoinActivity,
  useGetAccountCoinActivities,
  useGetAccountCoinActivitiesCount,
} from "../../../api/hooks/useGetAccountCoinActivities";
import HashButton, {HashType} from "../../../components/HashButton";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import {useSearchParams} from "../../../routing";

const PAGE_SIZE = 25;

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

type Props = {
  address: string;
  assetFilter: string;
};

export default function AssetFilteredTransactions({
  address,
  assetFilter,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const count = useGetAccountCoinActivitiesCount(address, assetFilter);
  const {data, isLoading, error} = useGetAccountCoinActivities(
    address,
    assetFilter,
    PAGE_SIZE,
    offset,
  );

  const numPages = count !== undefined ? Math.ceil(count / PAGE_SIZE) : 1;

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to filter transactions by asset. The asset type may be invalid or
        the indexer may be temporarily unavailable.
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{py: 4, textAlign: "center"}}>
        <Typography color="text.secondary">
          No activity found for asset &ldquo;{assetFilter}&rdquo; on this
          account
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {count !== undefined && (
        <Typography variant="body2" color="text.secondary">
          {count.toLocaleString()} activit{count !== 1 ? "ies" : "y"} for this
          asset
        </Typography>
      )}
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <ActivityTable activities={data} />
      </Box>
      {numPages > 1 && (
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <Pagination
            sx={{mt: 3}}
            count={numPages}
            variant="outlined"
            showFirstButton
            showLastButton
            page={currentPage}
            siblingCount={4}
            boundaryCount={0}
            shape="rounded"
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Stack>
  );
}

function ActivityTable({activities}: {activities: AccountCoinActivity[]}) {
  return (
    <Table
      aria-label="Account coin/FA activities"
      data-entity-type="transaction"
    >
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="version" />
          <GeneralTableHeaderCell header="type" />
          <GeneralTableHeaderCell header="amount" textAlignRight />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {activities.map((a) => (
          <GeneralTableRow key={`${a.transaction_version}-${a.event_index}`}>
            <GeneralTableCell>
              <HashButton
                hash={a.transaction_version.toString()}
                type={HashType.TRANSACTION}
              />
            </GeneralTableCell>
            <GeneralTableCell>
              <Chip
                label={getActivityLabel(a.type)}
                color={getActivityColor(a.type)}
                size="small"
                variant="outlined"
              />
            </GeneralTableCell>
            <GeneralTableCell align="right">
              {a.amount != null ? a.amount.toLocaleString() : "—"}
            </GeneralTableCell>
          </GeneralTableRow>
        ))}
      </GeneralTableBody>
    </Table>
  );
}
