import {useGetAccountResources} from "./useGetAccountResources";

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
  const accountResourcesResult = useGetAccountResources("0x1");

  if (!accountResourcesResult.data) return null;

  const votingForum = accountResourcesResult.data.find(
    (resource) =>
      resource.type ===
      "0x1::voting::VotingForum<0x1::governance_proposal::GovernanceProposal>",
  );

  if (!votingForum || !votingForum.data) return null;

  const votingForumData: votingForumData = votingForum.data as votingForumData;

  const nextProposalId = votingForumData.next_proposal_id;
  const handle = votingForumData.proposals.handle;

  return {nextProposalId, handle};
}
