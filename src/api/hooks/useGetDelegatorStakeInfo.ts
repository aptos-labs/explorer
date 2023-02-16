import {AptosClient, Types} from "aptos";
import {useState, useEffect} from "react";
import {getStake} from "..";
import {useGlobalState} from "../../GlobalState";

export function useGetDelegatorStakeInfo(delegatorAddress: Types.Address) {
  const [state, _] = useGlobalState();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stakes, setStakes] = useState<Types.MoveValue[]>([]);
  const client = new AptosClient(state.network_value);

  useEffect(() => {
    const fetchData = async () => {
      setStakes(await getStake(client, delegatorAddress));
      setIsLoading(false);
    };
    fetchData();
  }, [state.network_value]);

  return {stakes, isLoading};
}
