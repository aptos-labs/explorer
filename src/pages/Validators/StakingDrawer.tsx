import {
  Button,
  Divider,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import SideDrawer from "../../components/SideDrawer";
import {grey} from "../../themes/colors/libra2ColorPalette";
import {REWARDS_LEARN_MORE_LINK} from "./Components/Staking";
import {Link} from "../../routing";

type StakingDrawerProps = {
  open: boolean;
  handleClick: () => void;
};
const faqStakingData = [
  {
    question: "What is delegated staking?",
    answer: (
      <React.Fragment>
        As an APT holder, you can 'delegate' your APT to a delegation pool. The
        total delegation pool is an aggregation of staked APT from various token
        owners, and collectively staked. Aptos is a proof-of-stake network,
        which means that tokens are staked to{" "}
        <Link to={"#validators-section"}>validators</Link> in order to keep the
        network healthy.
        <br />
        <br />
        When you delegate stake, you own the tokens and earn{" "}
        <Link to={"#rewards-section"}>rewards</Link> on top of the staked
        amount. At no point does the validator have any access to your tokens as
        they remain securely in your control. The delegation smart contract has
        undergone security audit and thorough testing before launch.
      </React.Fragment>
    ),
  },
  {
    question: "Can anyone stake APT?",
    answer: "Yes, anyone can stake APT.",
  },
  {
    question: "Is there a minimum stake?",
    answer:
      "11 APT is the required minimum amount to stake. A refundable stake fee is deducted from the stake amount and returned at the end of the epoch.",
  },
  {
    question: "How can I stake APT?",
    answer: (
      <React.Fragment>
        You can stake APT directly by going to the{" "}
        <Link to={"/validators/delegation"}>Explorer</Link> page and connecting
        your wallet. If you are using the Petra wallet, you should see the
        following flow:
        <br />
        <br />
        <ol style={{marginLeft: "1em"}}>
          <li>
            Visit Explorer’s validators page and select the delegations node
            that you’d like to stake your APTs to.
          </li>
          <li>
            In the validator detail page, click “Stake” to starting staking APT
            with this validator.
          </li>
          <li>
            If you haven’t connected the wallet, you will be prompted to connect
            your Petra wallet first. Once you connect your wallet, you may start
            staking your APT through the stake dialog and approve transactions
            in your wallet.
          </li>
        </ol>
        <br />
        Congratulations! You have successfully staked APT on Explorer! You can
        also stake APT directly to a validator node through the{" "}
        <Link
          to="https://aptos.dev/en/network/nodes/validator-node/connect-nodes/delegation-pool-operations#perform-delegation-pool-operations"
          target="_blank"
        >
          CLI
        </Link>
        .
      </React.Fragment>
    ),
  },
  {
    question: "Can I unstake my APT anytime?",
    answer:
      "You can unstake your APT at any time, but the funds will not be available until the next validator unlock date. The validator unlock period is 14 days, but the timing follows from when the delegation pool is initiated. Depending on when in the cycle you choose to unstake your APT, it could be as little as a few hours, or up to 14 days from whence you can withdraw your tokens. I.e. if you unstake 10 days into the 14 day cycle, you have to wait 4 days. If you unstake 8 days into the 14 day cycle, you have to wait 6 days. If you unstaked your tokens, and the unlock date has passed, you will be able to withdraw the tokens.",
  },
  {
    question: "When can I withdraw funds?",
    answer: (
      <React.Fragment>
        There are two actions that you need to take: unstake and withdraw.{" "}
        <br />
        <br />
        You can withdraw unstaked APT at any time as long as it is unlocked. If
        you have staked APT, you will have to unstake first and wait for the
        funds to become unlocked. At that point in time, you can then withdraw
        it.
        <br />
        <br />
        You can see the unlock date in the dashboard.
      </React.Fragment>
    ),
  },
  {
    question:
      "What do these statuses mean? (Staked, Withdraw Pending, Withdraw Ready)",
    answer: (
      <React.Fragment>
        Staked means the tokens are currently staked and locked up. These cannot
        be withdrawn until you have completed unstaking.
        <br />
        <br />
        <span style={{fontWeight: "bold"}}>Withdraw Pending</span> means you
        have initiated unstaking those tokens, but they are still locked up and
        you have to wait for the next unlock date. These funds cannot be
        withdrawn until then. You can check the unlock date for your node by
        clicking on the node’s detailed page.
        <br />
        <br />
        <span style={{fontWeight: "bold"}}>Withdraw Ready</span> means you can
        withdraw funds. When you unstake, all previously Withdraw Pending funds
        will be withdrawn.
      </React.Fragment>
    ),
  },
  {
    question: "What is the add stake fee?",
    answer:
      "You may see that the amount you have staked is less than the total stake you added. This is because you don’t start earning rewards until the next epoch starts. This fee is returned at the end of the current epoch.",
  },
];

const faqRewardsData = [
  {
    question: "How can I earn rewards by staking APT?",
    answer:
      "You can earn rewards based on the amount of APT you have staked. Your node operator takes a commission, so the rewards you accrue will be net of that.",
  },
  {
    question: "Can the operator change their commission rate?",
    answer:
      "Commission rates are now subject to change by the operator. The new rate takes effect at the end of the lockup cycle. This period allows stakers to assess the new commission rate. If stakers are not in favor of the upcoming change, they have the full 7.5-day window to unstake their assets before the new rate takes effect.",
  },
  {
    question: "How much can I expect to earn?",
    answer:
      "The rewards you earn are calculated based on the amount of APT you have staked multiplied by the current annual rewards rate and the validator rewards performance minus the operator’s commission rate.",
  },
  {
    question: "When do I start earning rewards?",
    answer:
      "You will start earning rewards at the beginning of the next epoch. Epochs are the rewards cycle, and are currently 2 hours.",
  },
  {
    question: "How can I see how much rewards I’ve earned?",
    answer:
      "You can view the amount of rewards earned by going to the individual validator page.",
  },
];

const faqValidatorData = [
  {
    question: "What is a validator?",
    answer: (
      <React.Fragment>
        Validator nodes confirm transactions by proposing and executing blocks
        on the network. The stake that they hold helps to prove that they are
        trusted to vote on transactions. You can read more about how the Aptos
        blockchain works{" "}
        <Link
          to={
            "https://aptos.dev/en/network/blockchain/blockchain-deep-dive#consensus"
          }
          target="_blank"
        >
          here
        </Link>
        .
      </React.Fragment>
    ),
  },
  {
    question: "How do I choose a validator to stake with?",
    answer: (
      <React.Fragment>
        You can choose from the leaderboard on the explorer page which shows the
        details of the validator’s performance.
        <br />
        <br />
        Validators start earning rewards when the delegation pool has at least
        1M APT. Only active validators will earn rewards.
        <br />
        <br />
        However, please do your own research, Aptos labs is not responsible for
        the veracity of the information displayed, nor responsible for the
        security of your funds, past or future performance of the validator
        node.
      </React.Fragment>
    ),
  },
  {
    question: "How is validator performance measured?",
    answer: "Please see the definitions highlighted under the columns!",
  },
];

const faqData = [
  {title: "Staking", data: faqStakingData},
  {title: "Rewards", data: faqRewardsData},
  {title: "Validators", data: faqValidatorData},
];

export function StakingDrawer({open, handleClick}: StakingDrawerProps) {
  const theme = useTheme();

  return (
    <SideDrawer open={open} toggleSideDrawer={handleClick}>
      <List sx={{alignItems: "flex-start", margin: 3}}>
        <Typography variant="h4" sx={{margin: 1, marginBottom: 3}}>
          Delegated Staking FAQ
        </Typography>
        {faqData.map((faqData, index) => {
          return (
            <ListItem
              key={index}
              id={
                index === 0
                  ? "staking-section"
                  : index === 1
                    ? "rewards-section"
                    : "validators-section"
              }
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                padding: 1,
                color: theme.palette.mode === "dark" ? grey[300] : null,
              }}
            >
              <Typography variant="h5" component="p">
                {"I".repeat(index + 1) + ". " + faqData.title}
              </Typography>
              {faqData.data.map(({question, answer}) => (
                <ListItem
                  key={question}
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: 1,
                    color: theme.palette.mode === "dark" ? grey[300] : null,
                  }}
                >
                  <Typography variant="h6" component="p">
                    {question}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="p"
                    sx={{
                      fontFamily: "apparat,Geneva,Tahoma,Verdana,sans-serif",
                    }}
                  >
                    {answer}
                  </Typography>
                  <Divider flexItem sx={{marginY: 1}} />
                </ListItem>
              ))}
            </ListItem>
          );
        })}
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
