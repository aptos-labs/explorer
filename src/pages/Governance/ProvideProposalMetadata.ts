import {useEffect, useState} from "react";
import {ProposalType, ProposalMetadata} from "./Types";

const useProvideProposalMetadata = (
  proposal: ProposalType,
): ProposalMetadata | undefined => {
  const [metadata, setMetadata] = useState<ProposalMetadata>();
  const {metadata_location} = proposal.execution_content;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(metadata_location);
        const json = await response.json();
        setMetadata(json);
      } catch (error) {
        // TODO: error handling
        console.log("error", error);
      }
    };

    fetchMetadata();
  }, [metadata_location]);

  return metadata;
};

export default useProvideProposalMetadata;
