import React from "react";
import AccountTransactions from "../Components/AccountTransactions";
import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import AccountAllTransactions from "../Components/AccountAllTransactions";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {AccountData, MoveResource} from "@aptos-labs/ts-sdk";

type TransactionsTabProps = {
  address: string;
  accountData: AccountData | MoveResource[] | undefined;
};

export default function TransactionsTab({
  address,
  accountData,
}: TransactionsTabProps) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  // AccountTransactions: render transactions where the account is the sender
  // AccountAllTransactions: render all transactions where the account is involved
  if (Array.isArray(accountData)) {
    return isGraphqlClientSupported ? (
      <AccountAllTransactions address={address} />
    ) : (
      <EmptyTabContent />
    );
  }

  return isGraphqlClientSupported ? (
    <AccountAllTransactions address={address} />
  ) : (
    <AccountTransactions address={address} accountData={accountData} />
  );
}
