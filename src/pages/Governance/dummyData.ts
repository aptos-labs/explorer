import {ProposalType} from "./Types";

const METADATA_LOCATION_PLACEHOLDER =
  "https://mocki.io/v1/32403c87-d5d2-4136-80fd-d639a5d3d7dd";

enum ProposalState {
  PROPOSAL_STATE_SUCCEEDED = "Succeeded",
  PROPOSAL_STATE_FAILED = "Failed",
  PROPOSAL_STATE_PENDING = "Pending",
}

const EXPIRATION_SECS = "1660950116000"; // Aug 19 2022

export const proposalsData: ProposalType[] = [
  {
    proposal_id: "615737775483094",
    proposer:
      "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f673",
    creation_time_secs: "1659925697446570",
    execution_content: {
      vec : [
        {
          metadata_location: METADATA_LOCATION_PLACEHOLDER,
          metadata_hash:
            "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f675",
        }
      ]
    },
    execution_hash:
      "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f333",
    min_vote_threshold: 50,
    expiration_secs: EXPIRATION_SECS,
    early_resolution_vote_threshold: 100,
    yes_votes: 33,
    no_votes: 10,
    is_resolved: false,
  }
];
