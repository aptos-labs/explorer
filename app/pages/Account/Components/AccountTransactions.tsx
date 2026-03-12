import {Box, CircularProgress, Pagination} from "@mui/material";
import type React from "react";
import {useState} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import TransactionsTable from "../../Transactions/TransactionsTable";
import AccountError from "../Error";

export const TXN_PER_PAGE = 25;

export function getPageStartSequenceNumbers(sequenceNum: number): number[] {
  const pageStarts: number[] = [];

  const numOfPages = Math.ceil(sequenceNum / TXN_PER_PAGE);
  let num = sequenceNum;
  for (let i = 0; i < numOfPages; i++) {
    num = num - TXN_PER_PAGE;
    num = num >= 0 ? num : 0;
    pageStarts.push(num);
  }

  return pageStarts;
}

type TransactionsPaginationTableProps = {
  address: string;
  sequenceNum: number;
};

function TransactionsPaginationTable({
  address,
  sequenceNum,
}: TransactionsPaginationTableProps) {
  // TODO: make `start` a search param like the other transactions page
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  const numOfPages = Math.ceil(sequenceNum / TXN_PER_PAGE);
  const pageStarts = getPageStartSequenceNumbers(sequenceNum);

  const start = pageStarts[currentPageNum - 1];
  const limit =
    currentPageNum > 1 && currentPageNum === numOfPages
      ? pageStarts[currentPageNum - 2]
      : TXN_PER_PAGE;

  const {isLoading, data, error} = useGetAccountTransactions(
    address,
    start,
    limit,
  );

  if (error) {
    return <AccountError address={address} error={error} />;
  }

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    setCurrentPageNum(newPageNum);
  };

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {!data || data.length === 0 ? (
        <EmptyTabContent />
      ) : (
        <TransactionsTable transactions={data ?? []} />
      )}
      {numOfPages > 1 && (
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <Pagination
            sx={{mt: 3}}
            count={numOfPages}
            variant="outlined"
            showFirstButton
            showLastButton
            page={currentPageNum}
            siblingCount={4}
            boundaryCount={0}
            shape="rounded"
            onChange={handleChange}
          />
        </Box>
      )}
    </>
  );
}

type AccountTransactionsProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function AccountTransactions({
  address,
  accountData,
}: AccountTransactionsProps) {
  if (!accountData) {
    return <EmptyTabContent />;
  }

  return (
    <TransactionsPaginationTable
      address={address}
      sequenceNum={parseInt(accountData.sequence_number, 10)}
    />
  );
}
