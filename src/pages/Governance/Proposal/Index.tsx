import {Grid} from "@mui/material";
import React from "react";
import {ProposalHeader} from "./Header";
import {ProposalCard} from "./Card";
import {ProposalContent} from "./Content";
import useProvideMetadata from "../ProvideMedatada";
import {AptosClient, Types} from "aptos";
import {useQuery} from "react-query";
import {useGlobalState} from "../../../GlobalState";
import {ResponseError, withResponseError} from "../../../api/client";
import {useParams} from "react-router-dom";
import {Proposal} from "../Types";

// TODO: reuse table handle query from the proposal table
const TABLE_HANDLE = "66250964772389598023276627514581198483";

// TODO: generalize getTableItem logic for proposal page and proposal table
function getTableItem(
  tableHandle: string,
  data: Types.TableItemRequest,
  nodeUrl: string,
): Promise<any> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getTableItem(tableHandle, data));
}

function getProposalData(
  proposalId: string | undefined,
  tableHandle: string,
  networkValue: string,
): Proposal | null {
  const data: Types.TableItemRequest = {
    key_type: "u64",
    value_type:
      "0x1::voting::Proposal<0x1::governance_proposal::GovernanceProposal>",
    key: proposalId,
  };

  const tableItem = useQuery<any, ResponseError>(
    ["tableItem", tableHandle, data, networkValue],
    () => getTableItem(tableHandle, data, networkValue),
  );

  if (tableItem.data?.status !== 200) {
    return null;
  } else {
    return tableItem.data?.data;
  }
}

export const ProposalPage = () => {
  // TODO: add error handling
  const [state, _] = useGlobalState();
  const {id: proposalId} = useParams<string>();

  const proposal = getProposalData(
    proposalId,
    TABLE_HANDLE,
    state.network_value,
  );

  const metadata = useProvideMetadata(proposal);

  if (proposal == null) {
    return (
      <Grid container marginTop={{md: 12, xs: 6}}>
        PROPOSAL NOT FOUND
      </Grid>
    );
  }

  return (
    <Grid container marginTop={{md: 12, xs: 6}}>
      <Grid xs={12} item>
        <ProposalHeader proposal={proposal} metadata={metadata} />
      </Grid>
      <Grid xs={12} item sx={{mb: 6}}>
        <ProposalCard proposal={proposal} />
      </Grid>
      <Grid item sx={{mb: 6}}>
        <ProposalContent proposal={proposal} metadata={metadata} />
      </Grid>
    </Grid>
  );
};
