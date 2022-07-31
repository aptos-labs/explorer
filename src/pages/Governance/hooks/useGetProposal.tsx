import { useEffect, useState } from "react";
import {sha3_256} from "js-sha3";

import {getTableItem} from "../../../api";
import {GlobalState, useGlobalState} from "../../../GlobalState";
import {Proposal} from "../Types";

const fetchProposal = async (proposal_id: string, handle: string, state: GlobalState): Promise<Proposal | null> => {
  const votingTableItemRequest = {
    key_type: "u64",
    value_type:
      "0x1::voting::Proposal<0x1::governance_proposal::GovernanceProposal>",
    key: proposal_id,
  };

  // fetch table item
  const tableItemData = await getTableItem(
    {tableHandle: handle, data: votingTableItemRequest},
    state.network_value,
  );

  if (!tableItemData || tableItemData.status !== 200) return null;

  const proposalData = tableItemData.data;

  // fetch proposal metadata from metadata_location propoerty
  const {metadata_location} = proposalData.execution_content.vec[0];
  const response = await fetch(metadata_location);
  const metadata = await response.json();
  
  //validate metadata
  const {metadata_hash} = proposalData.execution_content.vec[0]
  const hash = sha3_256(JSON.stringify(metadata));

  //if(metadata_hash !== hash) return null;

  proposalData.proposal_id = proposal_id;
  proposalData.metadata = metadata;
  return proposalData;
}


export function useGetProposal(
  handle: string,
  proposal_id: string,
): Proposal | undefined{
  const [state, _setState] = useGlobalState();
  const [proposal, setProposal] = useState<Proposal>();

  useEffect(() => {
    fetchProposal(proposal_id, handle, state).
    then((data) => {
      data && setProposal(data)
    })
  },[])

  return proposal;
}
