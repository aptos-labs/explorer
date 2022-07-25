import {Grid} from "@mui/material";
import React, {useEffect, useState} from "react";
import {ProposalHeader} from "./Header";
import {ProposalCard} from "./Card";
import {ProposalContent} from "./Content";
import {proposalsData} from "../dummyData";
import {ProposalMetadata} from "../Types";

export const ProposalPage = () => {
  // TODO: add error handling

  const proposalData = proposalsData[0];

  const [metadata, setMetadata] = useState<ProposalMetadata>();
  const {metadata_location} = proposalData.execution_content;

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

  return (
    <Grid container marginTop={{md: 12, xs: 6}}>
      <Grid xs={12} item>
        <ProposalHeader proposal={proposalData} metadata={metadata} />
      </Grid>
      <Grid xs={12} item sx={{mb: 6}}>
        <ProposalCard proposal={proposalData} />
      </Grid>
      <Grid item sx={{mb: 6}}>
        <ProposalContent proposal={proposalData} metadata={metadata} />
      </Grid>
    </Grid>
  );
};
