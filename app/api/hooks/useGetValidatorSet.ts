import {tryStandardizeAddress} from "../../utils";
import {moveResourceData} from "../moveResource";
import {useGetAccountResource} from "./useGetAccountResource";

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

const EMPTY_VALIDATOR_SET = {
  totalVotingPower: null as string | null,
  numberOfActiveValidators: null as number | null,
};

/**
 * Reads `0x1::stake::ValidatorSet` whether the value is a REST `{type, data}`
 * resource or the inner payload returned by SDK `getAccountResource`.
 *
 * @internal Exported for unit tests (FEAT-VALIDATORS-002).
 */
export function readValidatorSet(validatorSet: unknown): {
  totalVotingPower: string | null;
  numberOfActiveValidators: number | null;
  activeValidators: Validator[];
} {
  const data = moveResourceData<ValidatorSetData>(validatorSet);
  if (data?.active_validators === undefined) {
    return {...EMPTY_VALIDATOR_SET, activeValidators: []};
  }

  return {
    totalVotingPower: data.total_voting_power,
    numberOfActiveValidators: data.active_validators.length,
    activeValidators: data.active_validators.map((validator) => {
      const processedAddr = tryStandardizeAddress(validator.addr);
      if (!processedAddr) {
        return validator;
      }
      return {
        ...validator,
        addr: processedAddr,
      };
    }),
  };
}

export function useGetValidatorSet() {
  const {data: validatorSet, isPending} = useGetAccountResource(
    "0x1",
    "0x1::stake::ValidatorSet",
  );

  return {
    ...readValidatorSet(validatorSet),
    isLoading: isPending,
  };
}
