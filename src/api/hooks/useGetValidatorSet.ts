import {useGlobalState} from "../../GlobalState";
import {useEffect, useState} from "react";
import {useGetAccountResource} from "./useGetAccountResource";

interface ValidatorSetData {
  active_validators: Validator[];
  total_voting_power: string;
}

interface Validator {
  addr: string;
  config: {
    consensus_pubkey: string;
    fullnode_addresses: string;
    network_addresses: string;
    validator_index: string;
  };
}

export function useGetValidatorSet() {
  const [state, _] = useGlobalState();
  const [totalVotingPower, setTotalVotingPower] = useState<string | null>(null);
  const [numberOfActiveValidators, setNumberOfActiveValidators] = useState<
    number | null
  >(null);

  const {accountResource: validatorSet} = useGetAccountResource(
    "0x1",
    "0x1::stake::ValidatorSet",
  );

  useEffect(() => {
    if (validatorSet?.data !== undefined) {
      const data = validatorSet.data as ValidatorSetData;
      setTotalVotingPower(data.total_voting_power);
      setNumberOfActiveValidators(data.active_validators.length);
    }
  }, [validatorSet?.data, state]);

  return {totalVotingPower, numberOfActiveValidators};
}
