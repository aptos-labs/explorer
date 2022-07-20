const TITLE_PLACEHOLDER_1 = "Title -- Lorem ipsum dolor sit amet";
const TITLE_PLACEHOLDER_2 = "This Is A Title";
const TITLE_PLACEHOLDER_3 =
  "Long Title: Lorem ipsum dolor sit amet consectetur adipiscing elit";
const TITLE_PLACEHOLDER_4 = "Hi! This Is A Title";

const DESCRIPTION_PLACEHOLDER =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

enum ProposalState {
  PROPOSAL_STATE_SUCCEEDED = "Succeeded",
  PROPOSAL_STATE_FAILED = "Failed",
  PROPOSAL_STATE_PENDING = "Pending",
}

const EXPIRATION_SECS = "1660950116000"; // Aug 19 2022

export const proposalsData = [
  {
    proposal_id: "615737775483094",
    proposer:
      "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f673",
    creation_time_secs: "1659925697446570",
    execution_content: {
      code_location: "www.code.com/locations/12345",
      title: TITLE_PLACEHOLDER_1,
      description: DESCRIPTION_PLACEHOLDER,
    },
    execution_hash:
      "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f333",
    min_vote_threshold: 50,
    expiration_secs: EXPIRATION_SECS,
    early_resolution_vote_threshold: 100,
    yes_votes: 33,
    no_votes: 10,
    is_resolved: false,
    is_voting_closed: false,
    proposal_state: ProposalState.PROPOSAL_STATE_PENDING,
  },
  {
    proposal_id: "615737775483094",
    proposer:
      "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f673",
    creation_time_secs: "1659965697446570",
    execution_content: {
      code_location: "www.code.com/locations/12345",
      title: TITLE_PLACEHOLDER_2,
      description: DESCRIPTION_PLACEHOLDER,
    },
    execution_hash:
      "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f333",
    min_vote_threshold: 50,
    expiration_secs: EXPIRATION_SECS,
    early_resolution_vote_threshold: 100,
    yes_votes: 33,
    no_votes: 10,
    is_resolved: false,
    is_voting_closed: false,
    proposal_state: ProposalState.PROPOSAL_STATE_FAILED,
  },
  {
    proposal_id: "615737775483094",
    proposer:
      "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f673",
    creation_time_secs: "1657995697446570",
    execution_content: {
      code_location: "www.code.com/locations/12345",
      title: TITLE_PLACEHOLDER_3,
      description: DESCRIPTION_PLACEHOLDER,
    },
    execution_hash:
      "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f333",
    min_vote_threshold: 50,
    expiration_secs: EXPIRATION_SECS,
    early_resolution_vote_threshold: 100,
    yes_votes: 33,
    no_votes: 10,
    is_resolved: false,
    is_voting_closed: false,
    proposal_state: ProposalState.PROPOSAL_STATE_SUCCEEDED,
  },
  {
    proposal_id: "615737775483094",
    proposer:
      "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f673",
    creation_time_secs: "1657935698446570",
    execution_content: {
      code_location: "www.code.com/locations/12345",
      title: TITLE_PLACEHOLDER_4,
      description: DESCRIPTION_PLACEHOLDER,
    },
    execution_hash:
      "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f333",
    min_vote_threshold: 50,
    expiration_secs: EXPIRATION_SECS,
    early_resolution_vote_threshold: 100,
    yes_votes: 33,
    no_votes: 10,
    is_resolved: false,
    is_voting_closed: false,
    proposal_state: ProposalState.PROPOSAL_STATE_SUCCEEDED,
  },
];
