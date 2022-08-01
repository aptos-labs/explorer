import {useEffect, useState} from "react";
import {sha3_256} from "js-sha3";

import {getTableItem} from "../../../api";
import {GlobalState, useGlobalState} from "../../../GlobalState";
import {Proposal, ProposalMetadata} from "../Types";
import { getProposalState, isVotingClosed } from "../utils";

const fetchTableItem = async (
  proposal_id: string,
  handle: string,
  state: GlobalState,
): Promise<Proposal | null> => {
  const votingTableItemRequest = {
    key_type: "u64",
    value_type:
      "0x1::voting::Proposal<0x1::governance_proposal::GovernanceProposal>",
    key: proposal_id,
  };

  const tableItemData = await getTableItem(
    {tableHandle: handle, data: votingTableItemRequest},
    state.network_value,
  );

  if (!tableItemData || tableItemData.status !== 200) return null;

  const proposalData = tableItemData.data;

  return proposalData;
};

const fetchMetadata = async (
  proposalData: Proposal,
): Promise<ProposalMetadata | null> => {
  // fetch proposal metadata from metadata_location propoerty
  const {metadata_location} = proposalData.execution_content.vec[0];
  const response = await fetch(metadata_location);
  // validate response status
  if (response.status !== 200) return null;

  const metadata = await response.json();

  // TODO - verify what exactly is being hashed on chain to know what needs to be hashed here for comparison
  //validate metadata
  const {metadata_hash} = proposalData.execution_content.vec[0];
  const hash = sha3_256(JSON.stringify(metadata));
  //if(metadata_hash !== hash) return null;

  return metadata;
};

const fetchProposal = async (
  proposal_id: string,
  handle: string,
  state: GlobalState,
): Promise<Proposal | null> => {
  // fetch proposal table item
  const proposalData = await fetchTableItem(proposal_id, handle, state);
  if (!proposalData) return null;

  // fetch proposal metadata
  const metadata = await fetchMetadata(proposalData);
  // if bad metadata response or metadata hash is different
  if (!metadata) return null;

  proposalData.proposal_state = getProposalState(proposalData);
  proposalData.is_voting_closed = isVotingClosed(proposalData)

  proposalData.proposal_id = proposal_id;
  proposalData.metadata = metadata;

  return proposalData;
};

export function useGetProposal(
  handle: string,
  proposal_id: string,
): Proposal | undefined {
  const [state, _setState] = useGlobalState();
  const [proposal, setProposal] = useState<Proposal>();

  useEffect(() => {
    fetchProposal(proposal_id, handle, state).then((data) => {
      data && setProposal(data);
    });
  }, []);

  return proposal;
}
