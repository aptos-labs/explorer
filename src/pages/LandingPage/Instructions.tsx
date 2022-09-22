import {
  Box,
  Button,
  Divider,
  Grid,
  Link,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import Card from "../../components/Card";
import {useWalletContext} from "../../context/wallet/context";
import {installWalletUrl} from "../../constants";

type InstructionsProps = {
  onVoteProposalButtonClick?: () => void;
};

type CardBoxProps = {
  children: React.ReactNode;
  title: string;
  content: string;
};

export function Instructions({onVoteProposalButtonClick}: InstructionsProps) {
  const theme = useTheme();
  const {isInstalled, isConnected, isAccountSet, connect} = useWalletContext();

  const CardBox = ({children, title, content}: CardBoxProps): JSX.Element => {
    return (
      <Card>
        <Box
          minHeight={280}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{color: "#1de9b6"}}>
              {title}
            </Typography>
            <Divider
              variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
              sx={{mt: 2}}
            />
          </Box>
          <Typography variant="body1" marginBottom={2}>
            {content}
          </Typography>
          {children}
        </Box>
      </Card>
    );
  };

  const ConnectWalletButton = (): JSX.Element => {
    return (
      <Button
        variant="primary"
        disabled={!isInstalled || isConnected}
        onClick={connect}
      >
        Connect
      </Button>
    );
  };

  const CreateAnAccountButton = (): JSX.Element => {
    return (
      <Tooltip title="Use the Wallet extension to create an account">
        <span>
          <Button
            fullWidth={true}
            variant="primary"
            sx={{cursor: "default"}}
            disabled={!isInstalled}
          >
            Create an Account
          </Button>
        </span>
      </Tooltip>
    );
  };

  return (
    <Grid mb={12}>
      <Typography variant="h4" marginBottom={4} textAlign="center">
        Let's Get Started
      </Typography>
      <Grid container spacing={6} justifyContent="center">
        <Grid item sm={4} lg={3}>
          <CardBox
            title="01/ Install"
            content="Download and Install Petra (Aptos Wallet) on Chrome"
          >
            <Button
              component={Link}
              href={installWalletUrl}
              target="_blank"
              variant="primary"
              disabled={isInstalled}
            >
              Install Wallet
            </Button>
          </CardBox>
        </Grid>
        <Grid item sm={4} lg={3}>
          <CardBox
            title="02/ Connect"
            content="Connect your wallet to begin voting"
          >
            {isAccountSet ? <ConnectWalletButton /> : <CreateAnAccountButton />}
          </CardBox>
        </Grid>
        <Grid item sm={4} lg={3}>
          <CardBox
            title="03/ Vote"
            content="Vote on a Proposal. You can vote on multiple proposals."
          >
            <Button
              variant="primary"
              onClick={onVoteProposalButtonClick}
              disabled={!isConnected}
            >
              Vote On Proposals
            </Button>
          </CardBox>
        </Grid>
      </Grid>
    </Grid>
  );
}
