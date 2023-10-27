import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getCoinBalanceChanges} from "../utils";
import {CoinBalanceChangeTable} from "./Components/CoinBalanceChangeTable";
import {User_Transaction} from "../../../gql/graphql";

type BalanceChangeTabProps = {
  transaction: User_Transaction;
};

export default function BalanceChangeTab({transaction}: BalanceChangeTabProps) {
  const balanceChanges = getCoinBalanceChanges(transaction);

  if (balanceChanges.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CoinBalanceChangeTable
      balanceChanges={balanceChanges}
      transaction={transaction}
    />
  );
}
