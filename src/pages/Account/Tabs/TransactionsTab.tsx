import React from "react";
import {Types} from "aptos";
import AccountTransactions from "../Components/AccountTransactions";
import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import AccountAllTransactions from "../Components/AccountAllTransactions";

type TransactionsTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function TransactionsTab({
  address,
  accountData,
}: TransactionsTabProps) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  // AccountTransactions: render transactions where the account is the sender
  // AccountAllTransactions: render all transactions where the account is involved
  return isGraphqlClientSupported ? (
    <AccountAllTransactions address={address} />
  ) : (
    <AccountTransactions address={address} accountData={accountData} />
  );
}
