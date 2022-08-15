import {Types} from "aptos";
import {useQuery} from "react-query";
import {getAccountResources} from "../../../api";
import {ResponseError} from "../../../api/client";
import {useGlobalState} from "../../../GlobalState";

interface votingForumData {
  next_proposal_id: string;
  proposals: {
    handle: string;
  };
}

type useGetProposalsTableData = {
  nextProposalId: string;
  handle: string;
};

export function useGetProposalsTableData(): useGetProposalsTableData | null {
  const [state, _setState] = useGlobalState();

  const accountResourcesResult = useQuery<
    Array<Types.MoveResource>,
    ResponseError
  >(["accountResources", {address: "0x1"}, state.network_value], () =>
    getAccountResources({address: "0x1"}, state.network_value),
  );

  if (!accountResourcesResult.data) return null;

  const votingForum = accountResourcesResult.data.filter((resource, i) => {
    return (
      resource.type ===
      "0x1::voting::VotingForum<0x1::governance_proposal::GovernanceProposal>"
    );
  });

  if (!votingForum[0].data) return null;

  const votingForumData: votingForumData = votingForum[0]
    .data as votingForumData;

  const nextProposalId = votingForumData.next_proposal_id;
  const handle = votingForumData.proposals.handle;

  return {nextProposalId, handle};
}
