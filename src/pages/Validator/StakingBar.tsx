import {Button, Divider, ListItem, ListItemText} from "@mui/material";
import React from "react";
import {MainnetValidatorData} from "../../api/hooks/useGetMainnetValidators";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";

type ValidatorStakingBarProps = {
  validator: MainnetValidatorData;
};

export default function StakingBar({validator}: ValidatorStakingBarProps) {
  const {totalVotingPower} = useGetValidatorSet();
  const votingPower = getFormattedBalanceStr(
    validator.voting_power.toString(),
    undefined,
    0,
  );
  const percentOfNetwork =
    parseInt(validator.voting_power) / parseInt(totalVotingPower!);

  return (
    <ContentBox padding={4}>
      <ListItem>
        <ListItem>
          <ListItemText
            primary={`${votingPower} APT`}
            secondary="Staked total"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`${(percentOfNetwork * 100).toFixed(2)} %`}
            secondary="of network"
          />
        </ListItem>
        <Divider orientation="vertical" flexItem variant="fullWidth"></Divider>
        <ListItem>
          <ListItemText primary="? APT" secondary="Ready for withdraw" />
        </ListItem>
        <Divider orientation="vertical" flexItem variant="fullWidth"></Divider>
        <ListItem>
          <ListItemText primary="? APT" secondary="Locked in pools" />
        </ListItem>
        <ListItem>
          <ListItemText primary="? APT" secondary="Rewards generated" />
        </ListItem>
        <Divider orientation="vertical" flexItem variant="fullWidth"></Divider>
        <Button>Stake</Button>
      </ListItem>
    </ContentBox>
  );
}
