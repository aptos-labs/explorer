import React, {useEffect} from "react";
import {Box, Divider, Grid, Typography} from "@mui/material";

import {WalletButton} from "../../../components/WalletButton";
import {
  connectToWallet,
  getAptosWallet,
  isWalletConnected,
} from "../../../api/wallet";
import {VoteButtons} from "./VoteButtons";
import {ProposalType} from "../Types";

type ProposalCardProps = {
  proposal: ProposalType;
};

export function ProposalCard({proposal}: ProposalCardProps) {
  const totalVotes = proposal.yes_votes + proposal.no_votes;
  const votedForPercent = ((proposal.yes_votes * 100) / totalVotes).toFixed(0);
  const votedAgainstrPercent = ((proposal.no_votes * 100) / totalVotes).toFixed(
    0,
  );

  const [wallet, setWallet] = React.useState<any>(null);
  const [walletIsConnected, setWalletIsConnected] =
    React.useState<boolean>(false);

  useEffect(() => {
    setWallet(getAptosWallet());
    isWalletConnected().then(setWalletIsConnected);
  }, []);

  const onConnectWalletClick = async () => {
    connectToWallet().then(setWalletIsConnected);
  };

  return (
    <Box position="relative">
      <Box
        component="div"
        sx={{top: "0.5rem", left: "-0.5rem", zIndex: "-10"}}
        height="100%"
        width="100%"
        position="absolute"
        borderRadius={1}
        border="1px solid gray"
      ></Box>

      <Box
        component="div"
        sx={{p: 2, flexGrow: 1, backgroundColor: "#151515"}}
        borderRadius={1}
        border="1px solid gray"
      >
        <Grid container sx={{p: 2}} alignItems="center" spacing={4}>
          <Grid
            item
            xs={12}
            sm={12}
            md={walletIsConnected ? 6 : 9}
            sx={{overflow: "hidden", textOverflow: "ellipsis"}}
          >
            <Typography>Results</Typography>
            <Divider variant="fullWidth" orientation="horizontal" />
            <Typography mt={2}>For: {votedForPercent}%</Typography>
            <Typography>Against: {votedAgainstrPercent}%</Typography>
          </Grid>
          {walletIsConnected ? (
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              textAlign={{xs: "left", sm: "right"}}
            >
              <VoteButtons />
            </Grid>
          ) : (
            <Grid
              item
              xs={12}
              sm={12}
              md={3}
              textAlign={{xs: "left", sm: "right"}}
            >
              <WalletButton
                onConnectWalletClick={onConnectWalletClick}
                walletIsConnected={walletIsConnected}
                wallet={wallet}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
