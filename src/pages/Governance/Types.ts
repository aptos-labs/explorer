// TODO: Proposal Type should be generated like Types.BlockMetadataTransaction
export type Proposal = {
  proposal_id: string;
  proposer: string;
  creation_time_secs: string;
  execution_content: {
    vec: [];
  };
  execution_hash: string;
  min_vote_threshold: number;
  expiration_secs: string;
  early_resolution_vote_threshold: {
    vec: Array<any>;
  };
  yes_votes: string;
  no_votes: string;
  is_resolved: boolean;
  metadata: {
    data: [
      {
        key: "metadata_hash";
        value: string;
      },
      {
        key: "metadata_location";
        value: string;
      },
    ];
  };
  proposal_metadata: ProposalMetadata;
  is_voting_closed: boolean;
  proposal_state: ProposalVotingState;
};

export type ProposalMetadata = {
  title: string;
  description: string;
  source_code_url: string;
  discussion_url: string;
};

export enum ProposalVotingState {
  PASSED = "Passed",
  PENDING = "Pending",
  FAILED = "Failed",
  REJECTED = "Rejected",
}

export enum ProposalExecutionState {
  WAITING_TO_BE_EXECUTED = "Waiting to be executed",
  EXECUTED = "Executed",
}
