import React from "react";
import {Grid} from "@mui/material";

import {Header} from "./Header";
import {ProposalsTable} from "./Table";
import { useQuery } from "react-query";
import { getAccountResources } from "../../../api";
import { useGlobalState } from "../../../GlobalState";
import { Types } from "aptos";
import { ResponseError } from "../../../api/client";

interface votingForumData {
  next_proposal_id: string,
  proposals : {
    handle: string
  }
}

export function GovernancePage() {
  // TODO - FETCH ALL PROPOSALS

  const [state, _setState] = useGlobalState();

  const accountResourcesResult = useQuery<
    Array<Types.AccountResource>,
    ResponseError
  >(["accountResources", {address:"0x1"}, state.network_value], () =>
    getAccountResources({address:"0x1"}, state.network_value),
  );

  if(!accountResourcesResult.data) return null;

  const votingForum = accountResourcesResult.data.filter((resource, i) => {
    return resource.type === "0x1::voting::VotingForum<0x1::governance_proposal::GovernanceProposal>"
  })

  if(!votingForum[0].data) return null;

  const votingForumData: votingForumData = votingForum[0].data as votingForumData;

  const next_proposal_id = votingForumData.next_proposal_id;
  const handle = votingForumData.proposals.handle;

  return (
    <Grid item xs={12} marginTop={{md: 12, xs: 6}}>
      <Grid item sx={{mb: 8}}>
        <Header />
      </Grid>
      <Grid>
        <ProposalsTable 
          next_proposal_id={next_proposal_id} 
          handle={handle}
        />
      </Grid>
    </Grid>
  );
}
