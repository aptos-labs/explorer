import React from "react";
import {Grid} from "@mui/material";

import {WalletButton} from "../../../../components/WalletButton";
import Card from "../../../../components/Card";
import {VoteButtons} from "../VoteButtons";
import {Proposal} from "../../Types";
import {useWalletContext} from "../../../../context/wallet/context";
import Results from "./Results";

type ProposalCardProps = {
  proposal: Proposal;
  proposalId: string;
};

export function ProposalCard({proposal, proposalId}: ProposalCardProps) {
  const {isConnected} = useWalletContext();

  return (
    <Card>
      <Grid container sx={{p: 2}} alignItems="center" spacing={4}>
        <Results proposal={proposal} />
        {isConnected ? (
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            textAlign={{xs: "left", sm: "right"}}
          >
            <VoteButtons proposalId={proposalId} />
          </Grid>
        ) : (
          <Grid
            item
            xs={12}
            sm={12}
            md={3}
            textAlign={{xs: "left", sm: "right"}}
          >
            <WalletButton />
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
