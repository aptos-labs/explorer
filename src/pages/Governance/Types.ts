// TODO: Proposal Type should be generated like Types.BlockMetadataTransaction
export type Proposal = {
  proposal_id: string;
  proposer: string;
  creation_time_secs: string;
  execution_content: {
    vec: Array<{
      metadata_location: string;
      metadata_hash: string;
    }>;
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
  metadata: ProposalMetadata;
  // TODO - fetch or calculate both on the client
  is_voting_closed: boolean;
  proposal_state: string;
};

export type ProposalMetadata = {
  execution_script: string;
  description: string;
  title: string;
};
