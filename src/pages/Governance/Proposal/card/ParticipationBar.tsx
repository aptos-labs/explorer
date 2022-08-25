import React from "react";
import {Stack, Box, Typography, Tooltip, Theme} from "@mui/material";
import {secondaryColor} from "../../constants";
import {useTheme} from "@mui/material/styles";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {useGetCoinSupplyLimit} from "../../hooks/useGetCoinSupplyLimit";
import {Proposal} from "../../Types";

const RADIUS = "0.7em";
const BAR_COLOR = secondaryColor;
const ANCHOR_WIDTH_PERCENTAGE = 1;

function getTotalVotes(proposal: Proposal): number {
  const yesVotes: number = parseInt(proposal.yes_votes);
  const noVotes: number = parseInt(proposal.no_votes);
  return yesVotes + noVotes;
}

function getFormattedVotesStr(votes: number): string {
  return votes.toLocaleString("en-US");
}

function TooltipContent(
  currentVotes: number,
  minVotes: number,
  totalSupply: number,
): JSX.Element {
  const currentPercentage = ((currentVotes / totalSupply) * 100).toFixed(0);
  const minPercentage = ((minVotes / totalSupply) * 100).toFixed(0);
  const enoughParticipation = currentVotes > minVotes;

  return (
    <Stack direction="column">
      <Box>{`- At least ${minPercentage}% participation is needed to proceed with this proposal. `}</Box>
      <Box>{`- Right now, ${currentPercentage}% of the voting power has participated. `}</Box>
      <Box>
        {!enoughParticipation &&
          `- This proposal will fail if there are not enough votes by the end of the voting period. ${getFormattedVotesStr(
            minVotes - currentVotes,
          )} more votes are needed.`}
      </Box>
    </Stack>
  );
}

function MinVoteAnchor({theme}: {theme: Theme}): JSX.Element {
  return (
    <Box
      component="div"
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? grey[50] : grey[800],
      }}
      width={`${ANCHOR_WIDTH_PERCENTAGE}%`}
    />
  );
}

type ParticipationBarProps = {
  proposal: Proposal;
};

export default function ParticipationBar({proposal}: ParticipationBarProps) {
  const supplyLimit = useGetCoinSupplyLimit();
  if (!supplyLimit) {
    return null;
  }

  const totalSupply = parseInt(supplyLimit);
  const currentVotes = getTotalVotes(proposal);
  const minVotes = proposal.min_vote_threshold;

  const theme = useTheme();
  const backgroundColor = theme.palette.mode === "dark" ? grey[800] : grey[200];

  const percentage = (currentVotes / totalSupply) * 100;
  const percentageStr = `${percentage.toFixed(0)}%`;

  const enoughParticipation = currentVotes > minVotes;
  const part1Percentage = enoughParticipation
    ? (minVotes / totalSupply) * 100 - ANCHOR_WIDTH_PERCENTAGE / 2
    : (currentVotes / totalSupply) * 100;
  const part2Percentage = enoughParticipation
    ? ((currentVotes - minVotes) / totalSupply) * 100 -
      ANCHOR_WIDTH_PERCENTAGE / 2
    : ((minVotes - currentVotes) / totalSupply) * 100 -
      ANCHOR_WIDTH_PERCENTAGE / 2;
  const part3Percentage = enoughParticipation
    ? ((totalSupply - currentVotes) / totalSupply) * 100
    : ((totalSupply - minVotes) / totalSupply) * 100 -
      ANCHOR_WIDTH_PERCENTAGE / 2;

  const part1 = (
    <Box
      component="div"
      sx={{
        pt: RADIUS,
        backgroundColor: BAR_COLOR,
        borderTopLeftRadius: RADIUS,
        borderBottomLeftRadius: RADIUS,
        borderTopRightRadius: "0",
        borderBottomRightRadius: "0",
      }}
      width={`${part1Percentage}%`}
    />
  );

  const part2 = (
    <Box
      component="div"
      sx={{
        pt: RADIUS,
        backgroundColor: enoughParticipation ? BAR_COLOR : backgroundColor,
        borderTopLeftRadius: part1Percentage == 0 ? RADIUS : "0",
        borderBottomLeftRadius: part1Percentage == 0 ? RADIUS : "0",
        borderTopRightRadius: percentage === 100 ? RADIUS : "0",
        borderBottomRightRadius: percentage === 100 ? RADIUS : "0",
      }}
      width={`${part2Percentage}%`}
    />
  );

  const part3 = (
    <Box
      component="div"
      sx={{
        pt: RADIUS,
        backgroundColor: backgroundColor,
        borderTopLeftRadius: percentage === 0 ? RADIUS : "0",
        borderBottomLeftRadius: percentage === 0 ? RADIUS : "0",
        borderTopRightRadius: RADIUS,
        borderBottomRightRadius: RADIUS,
      }}
      width={`${part3Percentage}%`}
    />
  );

  return (
    <Tooltip
      title={TooltipContent(currentVotes, minVotes, totalSupply)}
      placement="left"
    >
      <Stack>
        <Stack direction="row" justifyContent="space-between" paddingX={0.2}>
          <Typography variant="subtitle2" color={BAR_COLOR}>
            Participation
          </Typography>
          <Typography variant="subtitle2">{percentageStr}</Typography>
        </Stack>
        <Stack direction="row">
          {part1}
          {enoughParticipation && <MinVoteAnchor theme={theme} />}
          {part2}
          {!enoughParticipation && <MinVoteAnchor theme={theme} />}
          {part3}
        </Stack>
      </Stack>
    </Tooltip>
  );
}
