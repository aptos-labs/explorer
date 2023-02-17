import {AptosClient, Types} from "aptos";
import {useState, useEffect} from "react";
import {getStake} from "..";
import {useGlobalState} from "../../GlobalState";

export function useGetDelegatorStakeInfo(
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
) {
  const [state, _] = useGlobalState();
  const [stakes, setStakes] = useState<Types.MoveValue[]>([]);
  const client = new AptosClient(state.network_value);

  useEffect(() => {
    const fetchData = async () => {
      setStakes(await getStake(client, delegatorAddress, validatorAddress));
    };
    fetchData();
  }, [state.network_value]);

  return {stakes};
}
