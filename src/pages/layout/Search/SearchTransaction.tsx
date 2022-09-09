import React from "react";
import ResultLink from "./ResultLink";
import {useGetTransaction} from "../../../api/hooks/useGetTransaction";

type SearchTransactionProps = {
  txnHashOrVersion: string;
};

export default function SearchTransaction({
  txnHashOrVersion,
}: SearchTransactionProps) {
  const {isLoading, isError, data} = useGetTransaction(txnHashOrVersion);

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <ResultLink
      key={`st-${txnHashOrVersion}`}
      to={`/txn/${txnHashOrVersion}`}
      text={`Transaction ${txnHashOrVersion}`}
    />
  );
}
