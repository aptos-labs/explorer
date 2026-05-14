import {Box, CircularProgress} from "@mui/material";
import type {Types} from "~/types/aptos";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import PageNumberPagination, {
  useCurrentPage,
} from "../../../components/PageNumberPagination";
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
  const numOfPages = Math.ceil(sequenceNum / TXN_PER_PAGE);
  const currentPageRaw = useCurrentPage();
  // Clamp `?page=` to the available range so a stale or shared URL still
  // renders the closest valid page instead of an empty / errored table.
  const currentPageNum = Math.min(
    Math.max(1, currentPageRaw),
    Math.max(1, numOfPages),
  );

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
        <PageNumberPagination
          currentPage={currentPageNum}
          numPages={numOfPages}
        />
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
