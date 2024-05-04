import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useGetAccountResource} from "./useGetAccountResource";
import {standardizeAddress} from "../../utils";

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
  const [state] = useGlobalState();
  const [totalVotingPower, setTotalVotingPower] = useState<string | null>(null);
  const [numberOfActiveValidators, setNumberOfActiveValidators] = useState<
    number | null
  >(null);
  const [activeValidators, setActiveValidators] = useState<Validator[]>([]);

  const {data: validatorSet} = useGetAccountResource(
    "0x1",
    "0x1::stake::ValidatorSet",
  );

  useEffect(() => {
    if (validatorSet?.data !== undefined) {
      const data = validatorSet.data as ValidatorSetData;
      setTotalVotingPower(data.total_voting_power);
      setNumberOfActiveValidators(data.active_validators.length);
      setActiveValidators(
        data.active_validators.map((validator) => {
          const processedAddr = standardizeAddress(validator.addr);
          return {
            ...validator,
            addr: processedAddr,
          };
        }),
      );
    }
  }, [validatorSet?.data, state]);

  return {totalVotingPower, numberOfActiveValidators, activeValidators};
}
