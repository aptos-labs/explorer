import React, {useState} from "react";
import {Pagination, Box} from "@mui/material";
import TransactionsTable from "../../Transactions/TransactionsTable";
import Error from "../Error";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {useGlobalState} from "../../../GlobalState";
import {ResponseError} from "../../../api/client";
import {useQuery} from "react-query";
import {Types} from "aptos";
import {getAccount} from "../../../api";

const TXN_PER_PAGE = 25;

function getPageStartSequenceNumbers(sequenceNum: number): number[] {
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bf9963f (account transactions pagination)
  const {isLoading, data, error} = useGetAccountTransactions(
    address,
    start,
    limit,
  );
<<<<<<< HEAD
=======
  const {isLoading, data, error} = hasMoreThanOnePage
    ? useGetAccountTransactions(address, start, limit)
    : useGetAccountTransactions(address);
>>>>>>> e1249cd (pagination)
=======
>>>>>>> bf9963f (account transactions pagination)

  if (error) {
    return <Error address={address} error={error} />;
  }

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    setCurrentPageNum(newPageNum);
  };

  // TODO: add loading spinner
  return (
    <>
      {(!data || data.length === 0) && !isLoading ? (
        <EmptyTabContent />
      ) : (
        <TransactionsTable
          transactions={data ?? []}
          columns={[
            "sequenceNum",
            "version",
            "status",
            "type",
            "hash",
            "gas",
            "timestamp",
          ]}
        />
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

type TransactionsTabProps = {
  address: string;
};

export default function TransactionsTab({address}: TransactionsTabProps) {
  const [state, _] = useGlobalState();
  const {data} = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );

  if (!data) {
    return <EmptyTabContent />;
  }

  return (
    <TransactionsPaginationTable
      address={address}
      sequenceNum={parseInt(data.sequence_number)}
    />
  );
}
