import {useState, useEffect} from "react";
import {getStake} from "../v2";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddressInput} from "@aptos-labs/ts-sdk";

export function useGetDelegatorStakeInfo(
  delegatorAddress: AccountAddressInput,
  validatorAddress: AccountAddressInput,
) {
  const [state] = useGlobalState();
  const [stakes, setStakes] = useState<bigint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setStakes(
        await getStake(state.sdk_v2_client, delegatorAddress, validatorAddress),
      );
    };
    fetchData();
  }, [
    state.network_value,
    state.sdk_v2_client,
    delegatorAddress,
    validatorAddress,
  ]);

  return {stakes};
}
