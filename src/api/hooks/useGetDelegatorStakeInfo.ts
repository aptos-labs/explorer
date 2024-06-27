import {Types} from "aptos";
import {useState, useEffect} from "react";
import {getStake} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetDelegatorStakeInfo(
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
) {
  const [state] = useGlobalState();
  const [stakes, setStakes] = useState<Types.MoveValue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setStakes(
        await getStake(state.aptos_client, delegatorAddress, validatorAddress),
      );
    };
    fetchData();
  }, [
    state.network_value,
    state.aptos_client,
    delegatorAddress,
    validatorAddress,
  ]);

  return {stakes};
}
