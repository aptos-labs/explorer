import type {Types} from "~/types/aptos";
import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import AccountAllTransactions from "../Components/AccountAllTransactions";
import AccountTransactions from "../Components/AccountTransactions";

type TransactionsTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
};

export default function TransactionsTab({
  address,
  accountData,
}: TransactionsTabProps) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  // AccountTransactions: render transactions where the account is the sender
  // AccountAllTransactions: render all transactions where the account is involved
  if (!accountData) {
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
