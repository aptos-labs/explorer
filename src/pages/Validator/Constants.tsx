export const validatorCardDetailType = {
  operator: "Operator",
  numberOfDelegator: "Number of delegator",
  compoundRewards: "Compound rewards",
  operatorCommission: "Operator commission",
  nextUnlockIn: "Next unlock in",
  nodeStarted: "Node started",
  rewardsPerformance: "Rewards performance",
  lastEpochPerformance: "Last epoch performance",
  lastEpochDepositTotal: "Last epoch deposit total",
  lastEpochWithdrawTotal: "Last epoch withdraw total",
};

export type ValidatorCardDetailName = keyof typeof validatorCardDetailType;
