import {useGlobalState} from "../../GlobalState";
import {useEffect, useMemo, useState} from "react";
import {useGetAccountResource} from "./useGetAccountResource";
import {GeoData, useGetGeoData} from "./useGetValidatorSetGeoData";
import {getAccountResource} from "../../api/index";

const MAINNET_VALIDATORS_DATA_URL =
  "https://aptos-analytics-data-mainnet.s3.amazonaws.com/liveness.json";

interface ValidatorSetData {
  active_validators: Validator[];
  total_voting_power: string;
}

export interface Validator {
  addr: string;
  config: {
    consensus_pubkey: string;
    fullnode_addresses: string;
    network_addresses: string;
    validator_index: string;
  };
  voting_power: string;
}

export function useGetValidatorSet() {
  const [state, _] = useGlobalState();
  const [totalVotingPower, setTotalVotingPower] = useState<string | null>(null);
  const [numberOfActiveValidators, setNumberOfActiveValidators] = useState<
    number | null
  >(null);
  const [activeValidators, setActiveValidators] = useState<Validator[]>([]);

  const {accountResource: validatorSet} = useGetAccountResource(
    "0x1",
    "0x1::stake::ValidatorSet",
  );

  useEffect(() => {
    if (validatorSet?.data !== undefined) {
      const data = validatorSet.data as ValidatorSetData;
      setTotalVotingPower(data.total_voting_power);
      setNumberOfActiveValidators(data.active_validators.length);
      setActiveValidators(data.active_validators);
    }
  }, [validatorSet?.data, state]);

  return {totalVotingPower, numberOfActiveValidators, activeValidators};
}

export interface MainnetValidatorStatus {
  governance_voting_record: string;
  last_epoch: number;
  last_epoch_performance: string;
  liveness: number;
  owner_address: string;
  rewards_growth: number;
}

function useGetMainnetValidatorStatusSet() {
  const [state, _] = useGlobalState();
  const [validatorStatusSet, setValidatorStatusSet] = useState<
    MainnetValidatorStatus[]
  >([]);

  useEffect(() => {
    if (state.network_name === "mainnet") {
      const fetchData = async () => {
        const response = await fetch(MAINNET_VALIDATORS_DATA_URL);
        const data = await response.json();
        setValidatorStatusSet(data);
      };

      fetchData();
    } else {
      setValidatorStatusSet([]);
    }
  }, [state]);

  return {validatorStatusSet};
}

type StakePoolData = {
  operator_address: string;
};

function useGetValidatorToOperator() {
  const [state, _] = useGlobalState();
  const {activeValidators} = useGetValidatorSet();

  // save the validator to operator map to local storage
  // to avoid hitting rate limiting
  // as the query is very expensive
  useEffect(() => {
    if (!localStorage.getItem("validatorToOperator")) {
      const fetchStakePool = async (
        validatorAddr: string,
        validatorToOperatorMap: {[name: string]: string},
      ) => {
        const stakePoolResource = await getAccountResource(
          {address: validatorAddr, resourceType: "0x1::stake::StakePool"},
          state.network_value,
        );

        const operatorAddr = (stakePoolResource.data as StakePoolData)
          .operator_address;
        validatorToOperatorMap[validatorAddr] = operatorAddr;
      };

      const validatorToOperatorMap = {};
      const promises = activeValidators.map((validator) =>
        fetchStakePool(validator.addr, validatorToOperatorMap),
      );
      Promise.all(promises).then(() => {
        const validatorToOperatorMapStr = JSON.stringify(
          validatorToOperatorMap,
        );
        if (validatorToOperatorMapStr !== "{}") {
          localStorage.setItem(
            "validatorToOperator",
            validatorToOperatorMapStr,
          );
        }
      });
    }
  }, [activeValidators]);

  const validatorToOperatorStr = localStorage.getItem("validatorToOperator");
  return validatorToOperatorStr ? JSON.parse(validatorToOperatorStr) : null;
}

export interface MainnetValidator {
  address: string;
  voting_power: string;
  governance_voting_record: string | undefined;
  last_epoch: number | undefined;
  last_epoch_performance: string | undefined;
  liveness: number | undefined;
  rewards_growth: number | undefined;
  operator_addr: string | undefined;
  geo_data: GeoData | undefined;
}

export function useGetMainnetValidators() {
  const {activeValidators} = useGetValidatorSet();
  const {validatorStatusSet} = useGetMainnetValidatorStatusSet();
  const {geoDatas} = useGetGeoData();
  const validatorToOperator = useGetValidatorToOperator();
  const [validators, setValidators] = useState<MainnetValidator[]>([]);

  useMemo(() => {
    if (
      validatorStatusSet.length === activeValidators.length &&
      validatorStatusSet.length > 0 &&
      geoDatas.length > 0
    ) {
      const validators = activeValidators.map(
        (activeValidator: Validator): MainnetValidator => {
          const validatorStatus = validatorStatusSet.find(
            (validatorStatus) =>
              validatorStatus.owner_address === activeValidator.addr,
          );
          return {
            address: activeValidator.addr,
            voting_power: activeValidator.voting_power,
            governance_voting_record: validatorStatus?.governance_voting_record,
            last_epoch: validatorStatus?.last_epoch,
            last_epoch_performance: validatorStatus?.last_epoch_performance,
            liveness: validatorStatus?.liveness,
            rewards_growth: validatorStatus?.rewards_growth,
            operator_addr: validatorToOperator
              ? validatorToOperator[activeValidator.addr]
              : undefined,
            geo_data: geoDatas.find(
              (geoData) => `0x${geoData.peer_id}` === activeValidator.addr,
            ),
          };
        },
      );
      setValidators(validators);
    }
  }, [activeValidators, validatorStatusSet, geoDatas]);

  useEffect(() => {
    if (validatorToOperator) {
      validators.map((validator: MainnetValidator) => {
        validator.operator_addr = validatorToOperator[validator.address];
      });
    }
  }, [validators, validatorToOperator]);

  return {validators};
}
