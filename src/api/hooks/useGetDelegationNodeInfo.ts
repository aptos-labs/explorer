import {AptosClient, Types} from "aptos";
import {useState, useEffect} from "react";
import {getValidatorCommission} from "..";
import {useGlobalState} from "../../GlobalState";

export function useGetDelegationNodeInfo() {
  const [state, _] = useGlobalState();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commission, setCommission] = useState<Types.MoveValue>();
  const client = new AptosClient(state.network_value);
  
  useEffect(() => {
    const fetchData = async () => {
      setCommission(await getValidatorCommission(client));
      setIsLoading(false);
    };
    fetchData();
  }, [state.network_value]);

  return {
    // commission rate: 22.85% is represented as 2285
    commission: commission ? Number(commission) / 100 : undefined,
    isLoading,
  };
}
