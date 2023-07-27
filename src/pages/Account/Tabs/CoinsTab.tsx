import React from "react";
import {gql, useQuery} from "@apollo/client";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Types} from "aptos";
import {CoinsTable} from "../Components/CoinsTable";

const COINS_QUERY = gql`
  query CoinsData($owner_address: String, $limit: Int, $offset: Int) {
    current_coin_balances(
      where: {owner_address: {_eq: $owner_address}}
      limit: $limit
      offset: $offset
    ) {
      amount
      coin_type
      coin_info {
        name
        decimals
        symbol
      }
    }
  }
`;

type TokenTabsProps = {
  address: string;
  accountData: Types.AccountData | Types.MoveResource[] | undefined;
};

export default function CoinsTab({address}: TokenTabsProps) {
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const addr64Hash = "0x" + address.substring(2).padStart(64, "0");

  const {loading, error, data} = useQuery(COINS_QUERY, {
    variables: {
      owner_address: addr64Hash,
    },
  });

  if (loading || error) {
    // TODO: error handling
    return null;
  }

  // TODO: add graphql data typing
  const coins = data?.current_coin_balances ?? [];

  if (coins.length === 0) {
    return <EmptyTabContent />;
  }

  return <CoinsTable coins={coins} />;
}
