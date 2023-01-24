import {
  Button,
  Divider,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, {useState} from "react";
import {MainnetValidatorData} from "../../api/hooks/useGetMainnetValidators";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StakeDialog from "./StakeDialog";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";

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

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <ContentBox>
      <ListItem>
        <ListItem
          sx={{
            "@media screen and (min-width: 30em)": {
              width: "30%",
            },
          }}
        >
          <ListItemText
            primary={
              <Typography
                sx={{fontWeight: 600}}
              >{`${votingPower} APT`}</Typography>
            }
            secondary="Delegated Stake Amount"
          />
          <ListItemText
            primary={
              <Typography sx={{fontWeight: 600}}>
                {(percentOfNetwork * 100).toFixed(2)}%
              </Typography>
            }
            secondary="Of Network"
          />
        </ListItem>
        <Divider orientation="vertical" flexItem variant="fullWidth"></Divider>
        <ListItemText
          sx={{paddingLeft: 5}}
          primary={<Typography sx={{fontWeight: 600}}>? APT</Typography>}
          secondary="Rewards Earned So Far"
        />
        <Button variant="primary" onClick={handleClickOpen}>
          <ArrowCircleUpIcon sx={{marginRight: 1}} />
          <Typography>Stake</Typography>
        </Button>
      </ListItem>
      <StakeDialog handleDialogClose={handleClose} isDialogOpen={dialogOpen} />
    </ContentBox>
  );
}
