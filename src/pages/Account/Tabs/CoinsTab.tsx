import React from "react";
import {gql, useQuery} from "@apollo/client";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Types} from "aptos";
import {CoinsTable} from "../Components/CoinsTable";
import {normalizeAddress} from "../../../utils";

const COINS_QUERY = gql`
  query CoinsData($owner_address: String, $limit: Int, $offset: Int) {
    current_fungible_asset_balances(
      where: {owner_address: {_eq: $owner_address}}
      limit: $limit
      offset: $offset
    ) {
      amount
      asset_type
      metadata {
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
  const addr64Hash = normalizeAddress(address);

  const {loading, error, data} = useQuery(COINS_QUERY, {
    variables: {
      owner_address: addr64Hash,
    },
  });

  if (loading || error) {
    return null;
  }

  // TODO: add graphql data typing
  const coins = data?.current_fungible_asset_balances ?? [];

  if (coins.length === 0) {
    return <EmptyTabContent />;
  }

  return <CoinsTable coins={coins} />;
}
