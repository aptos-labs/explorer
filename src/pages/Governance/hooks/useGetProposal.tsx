import {useQuery} from "react-query";
import {getTableItem} from "../../../api";
import {useGlobalState} from "../../../GlobalState";
import {Proposal} from "../Types";

export function useGetProposal(
  handle: string,
  proposal_id: string,
): Proposal | null {
  const [state, _setState] = useGlobalState();

  const votingTableItemRequest = {
    key_type: "u64",
    value_type:
      "0x1::voting::Proposal<0x1::governance_proposal::GovernanceProposal>",
    key: proposal_id,
  };

  const {data: tableItemData} = useQuery(
    [
      "tableItem",
      {tableHandle: handle, data: votingTableItemRequest},
      state.network_value,
    ],
    () =>
      getTableItem(
        {tableHandle: handle, data: votingTableItemRequest},
        state.network_value,
      ),
  );

  if (!tableItemData || tableItemData.status !== 200) return null;

  const proposalData = tableItemData.data;
  proposalData.proposal_id = proposal_id;

  return proposalData;
}
