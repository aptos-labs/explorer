import {Types} from "aptos";
import {useState, useEffect} from "react";
import {getStake} from "..";
import {useGlobalState} from "../../GlobalState";

export function useGetDelegatorStakeInfo(delegatorAddress: Types.Address) {
  const [state, _] = useGlobalState();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stake, setStake] = useState<Types.MoveValue[]>([]);

  useEffect(() => {
    if (stake !== undefined) {
      const fetchData = async () => {
        const stakes = await getStake(state.network_value, delegatorAddress);
        setStake(stakes);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [stake, state]);

  return {stake, isLoading};
}
