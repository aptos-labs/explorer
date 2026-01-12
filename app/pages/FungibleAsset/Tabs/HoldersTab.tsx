import React, {useState} from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {
  CoinHolder,
  useGetCoinHolders,
} from "../../../api/hooks/useGetCoinHolders";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {FACombinedData} from "../Index";
import {Box, CircularProgress, Pagination} from "@mui/material";

type HoldersTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

const LIMIT = 25;

export default function HoldersTab({address, data}: HoldersTabProps) {
  const [page, setPage] = useState(1);
  const [prevAddress, setPrevAddress] = useState(address);

  // Reset page when address changes (during render, per React best practices)
  if (address !== prevAddress) {
    setPrevAddress(address);
    setPage(1);
  }

  const offset = (page - 1) * LIMIT;
  const holderData = useGetCoinHolders(address, LIMIT, offset);

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

  const pageCount = holderData.count ? Math.ceil(holderData.count / LIMIT) : 0;

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box>
      <HoldersTable data={data} holders={holderData.data} offset={offset} />
      {pageCount > 1 && (
        <Box sx={{display: "flex", justifyContent: "center", padding: 2}}>
          <Pagination count={pageCount} page={page} onChange={handleChange} />
        </Box>
      )}
    </Box>
  );
}

export function HoldersTable({
  data,
  holders,
  offset = 0,
}: {
  holders: CoinHolder[];
  data: FACombinedData;
  offset?: number;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="rank" />
          <GeneralTableHeaderCell header="holder address" />
          <GeneralTableHeaderCell header="amount" textAlignRight={true} />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {holders.map((holder, i) => {
          return (
            <GeneralTableRow key={holder.owner_address}>
              <GeneralTableCell>{offset + i + 1}</GeneralTableCell>
              <GeneralTableCell>
                <HashButton
                  hash={holder.owner_address}
                  type={HashType.ACCOUNT}
                />
              </GeneralTableCell>
              <GeneralTableCell align={"right"}>
                {getFormattedBalanceStr(
                  holder.amount.toString(),
                  data.coinData?.decimals ?? data.metadata?.decimals,
                ) +
                  " " +
                  (data.coinData?.symbol ?? data.metadata?.symbol)}
              </GeneralTableCell>
            </GeneralTableRow>
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
