import {
  Box,
  Button,
  Divider,
  Grid,
  Link,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import Card from "../../../components/Card";
import {useWalletContext} from "../../../context/wallet/context";

type InstructionsProps = {
  scrollTableIntoView: () => void;
};

type CardBoxProps = {
  children: React.ReactNode;
  title: string;
  content: string;
};

export function Instructions({scrollTableIntoView}: InstructionsProps) {
  const theme = useTheme();
  const {isInstalled, isConnected, connect} = useWalletContext();

  const onVoteProposalClick = () => {
    scrollTableIntoView()
  };

  const CardBox = ({children, title, content}: CardBoxProps) => {
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
              <Button
                variant="primary"
                disabled={!isInstalled || isConnected}
                onClick={connect}
              >
                Connect
              </Button>
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
                onClick={onVoteProposalClick}
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
