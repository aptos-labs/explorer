import {
  Button,
  Divider,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import SideDrawer from "../../components/SideDrawer";
import {InlineMarkup, useTranslation} from "../../i18n";
import {REWARDS_LEARN_MORE_LINK} from "./Components/Staking";

type StakingDrawerProps = {
  open: boolean;
  handleClick: () => void;
};

type FaqItem = {
  questionKey: string;
  answerKeys: string[];
  stepsKey?: string;
};

const faqStakingItems: FaqItem[] = [
  {
    questionKey: "staking.faq.whatIsQ",
    answerKeys: ["staking.faq.whatIsA1", "staking.faq.whatIsA2"],
  },
  {questionKey: "staking.faq.anyoneQ", answerKeys: ["staking.faq.anyoneA"]},
  {questionKey: "staking.faq.minQ", answerKeys: ["staking.faq.minA"]},
  {
    questionKey: "staking.faq.howQ",
    answerKeys: ["staking.faq.howA1"],
    stepsKey: "staking.faq.howSteps",
  },
  {questionKey: "staking.faq.unstakeQ", answerKeys: ["staking.faq.unstakeA"]},
  {
    questionKey: "staking.faq.withdrawQ",
    answerKeys: [
      "staking.faq.withdrawA1",
      "staking.faq.withdrawA2",
      "staking.faq.withdrawA3",
    ],
  },
  {
    questionKey: "staking.faq.statusQ",
    answerKeys: [
      "staking.faq.statusA1",
      "staking.faq.statusA2",
      "staking.faq.statusA3",
    ],
  },
  {questionKey: "staking.faq.feeQ", answerKeys: ["staking.faq.feeA"]},
];

const faqRewardsItems: FaqItem[] = [
  {questionKey: "staking.faq.earnQ", answerKeys: ["staking.faq.earnA"]},
  {
    questionKey: "staking.faq.commissionQ",
    answerKeys: ["staking.faq.commissionA"],
  },
  {questionKey: "staking.faq.expectQ", answerKeys: ["staking.faq.expectA"]},
  {questionKey: "staking.faq.startQ", answerKeys: ["staking.faq.startA"]},
  {questionKey: "staking.faq.seeQ", answerKeys: ["staking.faq.seeA"]},
];

const faqValidatorItems: FaqItem[] = [
  {
    questionKey: "staking.faq.validatorQ",
    answerKeys: ["staking.faq.validatorA"],
  },
  {
    questionKey: "staking.faq.chooseQ",
    answerKeys: [
      "staking.faq.chooseA1",
      "staking.faq.chooseA2",
      "staking.faq.chooseA3",
    ],
  },
  {questionKey: "staking.faq.perfQ", answerKeys: ["staking.faq.perfA"]},
];

const faqSections = [
  {
    titleKey: "staking.faq.staking",
    id: "staking-section",
    items: faqStakingItems,
  },
  {
    titleKey: "staking.faq.rewards",
    id: "rewards-section",
    items: faqRewardsItems,
  },
  {
    titleKey: "staking.faq.validators",
    id: "validators-section",
    items: faqValidatorItems,
  },
];

const answerSx = {
  fontFamily: "apparat,Geneva,Tahoma,Verdana,sans-serif",
} as const;

function FaqAnswer({item}: {item: FaqItem}) {
  const {t, tList} = useTranslation();
  const paragraphs = [...item.answerKeys];
  const afterSteps =
    item.stepsKey && item.questionKey === "staking.faq.howQ"
      ? ["staking.faq.howA2"]
      : [];

  return (
    <>
      {paragraphs.map((key) => (
        <Typography
          key={key}
          variant="body2"
          component="p"
          sx={{...answerSx, mb: 1}}
        >
          <InlineMarkup text={t(key)} />
        </Typography>
      ))}
      {item.stepsKey ? (
        <ol style={{marginLeft: "1em"}}>
          {tList(item.stepsKey).map((step) => (
            <li key={step}>
              <Typography variant="body2" component="span" sx={answerSx}>
                <InlineMarkup text={step} />
              </Typography>
            </li>
          ))}
        </ol>
      ) : null}
      {afterSteps.map((key) => (
        <Typography
          key={key}
          variant="body2"
          component="p"
          sx={{...answerSx, mt: 1}}
        >
          <InlineMarkup text={t(key)} />
        </Typography>
      ))}
    </>
  );
}

export function StakingDrawer({open, handleClick}: StakingDrawerProps) {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <SideDrawer open={open} toggleSideDrawer={handleClick}>
      <List sx={{alignItems: "flex-start", margin: 3}}>
        <Typography variant="h4" sx={{margin: 1, marginBottom: 3}}>
          {t("staking.faq.title")}
        </Typography>
        {faqSections.map((faqSection, index) => {
          return (
            <ListItem
              key={faqSection.id}
              id={faqSection.id}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                padding: 1,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.text.secondary
                    : null,
              }}
            >
              <Typography variant="h5" component="p">
                {`${"I".repeat(index + 1)}. ${t(faqSection.titleKey)}`}
              </Typography>
              {faqSection.items.map((item) => (
                <ListItem
                  key={item.questionKey}
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: 1,
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.text.secondary
                        : null,
                  }}
                >
                  <Typography variant="h6" component="p">
                    {t(item.questionKey)}
                  </Typography>
                  <FaqAnswer item={item} />
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
          rel="noopener noreferrer"
        >
          {t("staking.faq.learnMore")}
        </Button>
      </List>
    </SideDrawer>
  );
}
