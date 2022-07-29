import { Types } from "aptos";
import { useQuery } from "react-query";
import { getTableItem } from "../../../api";
import { ResponseError } from "../../../api/client";
import { useGlobalState } from "../../../GlobalState";
import { Proposal, ProposalsResponseType } from "../Types";

export function useGetProposal(handle:string,proposal_id:string): Proposal | null{

  const [state, _setState] = useGlobalState();

  const votingTableItemRequest = {
    key_type: "u64",
    value_type: "0x1::voting::Proposal<0x1::governance_proposal::GovernanceProposal>",
    key: proposal_id
  }

  const {data} = useQuery(
    ["tableItem"+proposal_id, handle, votingTableItemRequest, state.network_value], () =>
    getTableItem(handle, votingTableItemRequest, state.network_value)
    )

  if(!data || data.status !== 200) return null;

  const tableItemData = data as unknown as ProposalsResponseType
  const proposalData = tableItemData.data
  proposalData.proposal_id = proposal_id;

  return proposalData;
}