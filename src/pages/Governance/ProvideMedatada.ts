import {useEffect, useState} from "react";
import {Proposal, ProposalMetadata} from "./Types";

const emptyMetadata: ProposalMetadata = {
  execution_script: "N/A",
  description: "N/A",
  title: "N/A",
};

const useProvideMetadata = (proposal: Proposal): ProposalMetadata => {
  const [metadata, setMetadata] = useState<ProposalMetadata>(emptyMetadata);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (
        proposal?.execution_content?.vec == null ||
        proposal?.execution_content?.vec.length == 0
      ) {
        return;
      }

      const {metadata_location} = proposal.execution_content.vec[0];

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
  }, [proposal]);

  return metadata;
};

export default useProvideMetadata;
