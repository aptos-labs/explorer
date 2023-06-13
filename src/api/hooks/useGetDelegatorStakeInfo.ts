import {AptosClient, Types} from "aptos";
import {useState, useEffect} from "react";
import {getStake} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetDelegatorStakeInfo(
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
) {
  const [state, _] = useGlobalState();
  const [stakes, setStakes] = useState<Types.MoveValue[]>([]);

  useEffect(() => {
    const client = new AptosClient(state.network_value);
    const fetchData = async () => {
      setStakes(await getStake(client, delegatorAddress, validatorAddress));
    };
    fetchData();
  }, [state.network_value, delegatorAddress, validatorAddress]);

  return {stakes};
}
