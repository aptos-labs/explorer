import {useEffect, useState} from "react";

import {getTableItem} from "../../../api";
import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import {useWalletContext} from "../../../context/wallet/context";
import {GlobalState, useGlobalState} from "../../../GlobalState";

const fetchTableItem = async (
  pool_address: string,
  proposal_id: string,
  handle: string,
  state: GlobalState,
): Promise<boolean> => {
  const tableItemRequest = {
    key_type: "0x1::aptos_governance::RecordKey",
    value_type: "bool",
    key: {
      stake_pool: pool_address,
      proposal_id,
    },
  };

  await getTableItem(
    {tableHandle: handle, data: tableItemRequest},
    state.network_value,
  );

  return true;
};

interface VotingRecords {
  votes: {
    handle: string;
  };
}

interface OwnerCapability {
  pool_address: string;
}

export function useAccountHasVoted(proposalId: string): boolean {
  const [state, _setState] = useGlobalState();
  const {accountAddress} = useWalletContext();
  const [hasVoted, setHadVoted] = useState<boolean>(false);

  const {accountResource: ownerCapabilityResource} = useGetAccountResource(
    accountAddress || "0x1",
    "0x1::stake::OwnerCapability",
  );

  const {accountResource: votingRecordResource} = useGetAccountResource(
    "0x1",
    "0x1::aptos_governance::VotingRecords",
  );

  useEffect(() => {
    if (!votingRecordResource || !ownerCapabilityResource) return;

    const votingResource = votingRecordResource.data as VotingRecords;
    const {handle} = votingResource.votes;

    const ownerCapability = ownerCapabilityResource.data as OwnerCapability;
    const {pool_address} = ownerCapability;

    fetchTableItem(pool_address, proposalId, handle, state)
      .then(setHadVoted)
      .catch(() => setHadVoted(false)); // fetchTableItem returns a 404 error if the item is not in the table
  }, [votingRecordResource, ownerCapabilityResource]);

  return hasVoted;
}
