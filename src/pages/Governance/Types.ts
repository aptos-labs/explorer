export type ProposalType = {
  proposal_id: string;
  proposer: string;
  creation_time_secs: string;
  execution_content: {
    vec: [
      {
        metadata_location: string;
        metadata_hash: string;
      }
    ]
  };
  execution_hash: string;
  min_vote_threshold: number;
  expiration_secs: string;
  early_resolution_vote_threshold: number;
  yes_votes: number;
  no_votes: number;
  is_resolved: boolean;
  // TODO - need to add to api response
  //is_voting_closed: boolean;
  //proposal_state: string;
};

export type ProposalMetadata = {
  execution_script: string;
  description: string;
  title: string;
};

export type ProposalsResponseType = {
  data : ProposalType
}
