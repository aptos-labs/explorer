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
import Card from "../../../components/Card";
import {useWalletContext} from "../../../context/wallet/context";

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
      <Box
        minHeight={400}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
        }}
      >
        <Typography variant="h6" sx={{color: "#1de9b6"}}>
          {title}
        </Typography>
        <Divider
          variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
        />
        <Typography variant="body1">{content}</Typography>
        {children}
      </Box>
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
            create an account
          </Button>
        </span>
      </Tooltip>
    );
  };

  return (
    <Grid mb={12}>
      <Typography variant="h4" marginBottom={1} textAlign="center">
        Let's Get Started
      </Typography>
      <Grid container marginTop={4} spacing={6} justifyContent="center">
        <Grid item sm={3}>
          <Card>
            <CardBox
              title="01/ Install"
              content="Download and Install the Aptos Wallet on Chrome"
            >
              <Button
                component={Link}
                href="https://aptos.dev/guides/building-wallet-extension"
                target="_blank"
                variant="primary"
                disabled={isInstalled}
              >
                Install Wallet
              </Button>
            </CardBox>
          </Card>
        </Grid>
        <Grid item sm={3}>
          <Card>
            <CardBox
              title="02/ Connect"
              content="Connect your Aptos wallet to enable voting"
            >
              {isAccountSet ? (
                <ConnectWalletButton />
              ) : (
                <CreateAnAccountButton />
              )}
            </CardBox>
          </Card>
        </Grid>
        <Grid item sm={3}>
          <Card>
            <CardBox
              title="03/ Vote"
              content="Vote on a Proposal dolor sit amet, consectetur commodo."
            >
              <Button
                variant="primary"
                onClick={onVoteProposalButtonClick}
                disabled={!isConnected}
              >
                Vote on a Proposal
              </Button>
            </CardBox>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
