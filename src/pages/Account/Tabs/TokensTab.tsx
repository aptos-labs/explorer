import React from "react";
import {gql, useQuery} from "@apollo/client";
import {TokensTable} from "../Components/TokensTable";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Types} from "aptos";

const TOKENS_QUERY = gql`
  query TokensData($owner_address: String) {
    current_token_ownerships(
      where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}}
    ) {
      token_data_id_hash
      name
      collection_name
      table_type
      property_version
      amount
    }
  }
`;

type TokenTabsProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function TokenTabs({address}: TokenTabsProps) {
  const {loading, error, data} = useQuery(TOKENS_QUERY, {
    variables: {
      owner_address: address,
    },
  });

  if (loading || error) {
    // TODO: error handling
    return null;
  }

  // TODO: add graphql data typing
  const tokens = data?.current_token_ownerships ?? [];

  if (tokens.length === 0) {
    return <EmptyTabContent />;
  }

  return <TokensTable tokens={tokens} />;
}
