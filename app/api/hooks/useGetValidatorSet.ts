import {useGetAccountResource} from "./useGetAccountResource";
import {tryStandardizeAddress} from "../../utils";

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
  const {data: validatorSet} = useGetAccountResource(
    "0x1",
    "0x1::stake::ValidatorSet",
  );

  // Calculate values during render instead of using useEffect
  let totalVotingPower: string | null = null;
  let numberOfActiveValidators: number | null = null;
  let activeValidators: Validator[] = [];

  if (validatorSet?.data !== undefined) {
    const data = validatorSet.data as ValidatorSetData;
    totalVotingPower = data.total_voting_power;
    numberOfActiveValidators = data.active_validators.length;
    activeValidators = data.active_validators.map((validator) => {
      const processedAddr = tryStandardizeAddress(validator.addr);
      if (!processedAddr) {
        return validator;
      }
      return {
        ...validator,
        addr: processedAddr,
      };
    });
  }

  return {totalVotingPower, numberOfActiveValidators, activeValidators};
}
