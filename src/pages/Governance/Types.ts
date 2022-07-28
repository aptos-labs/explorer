export type ProposalType = {
  proposal_id: string;
  proposer: string;
  creation_time_secs: string;
  execution_content: {
    metadata_location: string;
    metadata_hash: string;
  };
  execution_hash: string;
  min_vote_threshold: number;
  expiration_secs: string;
  early_resolution_vote_threshold: number;
  yes_votes: number;
  no_votes: number;
  is_resolved: boolean;
  is_voting_closed: boolean;
  proposal_state: string;
};

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
  yes_votes: number;
  no_votes: number;
  is_resolved: boolean;
  // is_voting_closed: boolean;
  proposal_state: string;
};

export type ProposalMetadata = {
  execution_script: string;
  description: string;
  title: string;
};
