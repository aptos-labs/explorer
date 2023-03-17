import {
  Button,
  Divider,
  Link,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import SideDrawer from "../../components/SideDrawer";
import {REWARDS_LEARN_MORE_LINK} from "./Components/Staking";

type StakingDrawerProps = {
  open: boolean;
  handleClick: () => void;
};

export function StakingDrawer({open, handleClick}: StakingDrawerProps) {
  const theme = useTheme();

  return (
    <SideDrawer open={open} toggleSideDrawer={handleClick}>
      <List sx={{alignItems: "flex-start", margin: 3}}>
        <Typography variant="h4" sx={{margin: 1, marginBottom: 3}}>
          Delegated Staking FAQ
        </Typography>
        <Divider flexItem sx={{marginY: 1}} />
        <ListItem
          sx={{
            flexDirection: "column",
            alignItems: "flex-start",
            padding: 1,
            color: theme.palette.mode === "dark" ? "#D4D4D4" : null,
          }}
        >
          <Typography variant="h5" paragraph>
            What is delegated staking?
          </Typography>
          <Typography variant="body2" paragraph>
            As an APT holder, you can ‘delegate’ your APT to a delegation pool.
            The total delegation pool is an aggregation of staked APT from
            various token owners, and collectively staked. Aptos is a
            proof-of-stake network, which means that tokens are staked to
            validators in order to keep the network healthy.
          </Typography>
          <Typography variant="body2" paragraph>
            When you delegate stake, you own the tokens and earn{" "}
            {
              <Link
                alignSelf="flex-end"
                href={REWARDS_LEARN_MORE_LINK}
                color="inherit"
                target="_blank"
              >
                rewards
              </Link>
            }{" "}
            on top of the staked amount. At no point does the validator have any
            access to your tokens as they remain securely in your control. The
            delegation smart contract has undergone security audit and thorough
            testing before launch.
          </Typography>
        </ListItem>
        <Divider flexItem sx={{marginY: 1}} />
        <ListItem
          sx={{
            flexDirection: "column",
            alignItems: "flex-start",
            padding: 1,
            color: theme.palette.mode === "dark" ? "#D4D4D4" : null,
          }}
        >
          <Typography variant="h5" paragraph>
            Can anyone stake APT?
          </Typography>
          <Typography variant="body2" paragraph>
            Yes, anyone can stake APT.
          </Typography>
        </ListItem>
        <Divider flexItem sx={{marginY: 1}} />
        <ListItem
          sx={{
            flexDirection: "column",
            alignItems: "flex-start",
            padding: 1,
            color: theme.palette.mode === "dark" ? "#D4D4D4" : null,
          }}
        >
          <Typography variant="h5" paragraph>
            Is there a minimum stake?
          </Typography>
          <Typography variant="body2" paragraph>
            10 APT is the required minimum amount to stake.
          </Typography>
        </ListItem>
        <Divider flexItem sx={{marginY: 1}} />
        <ListItem
          sx={{
            flexDirection: "column",
            alignItems: "flex-start",
            padding: 1,
            color: theme.palette.mode === "dark" ? "#D4D4D4" : null,
          }}
        >
          <Typography variant="h5" paragraph>
            How can I stake APT?
          </Typography>
          <Typography variant="body2" paragraph>
            You can stake APT directly by going to the Explorer page and
            connecting your wallet. If you are using the Petra wallet, you
            should see the following flow:
          </Typography>
        </ListItem>
        <Divider flexItem sx={{marginY: 1}} />
        <Button
          variant="outlined"
          sx={{margin: 1, marginTop: 2}}
          href={REWARDS_LEARN_MORE_LINK}
          target="_blank"
        >
          Learn more about staking
        </Button>
      </List>
    </SideDrawer>
  );
}
