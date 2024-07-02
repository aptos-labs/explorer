import {useState, useEffect} from "react";
import {getStake} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddress, MoveValue} from "@aptos-labs/ts-sdk";

export function useGetDelegatorStakeInfo(
  delegatorAddress: string | undefined,
  validatorAddress: string,
) {
  const [state] = useGlobalState();
  const [stakes, setStakes] = useState<MoveValue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (delegatorAddress === undefined || delegatorAddress === null) {
        setStakes([]);
        return;
      }

      setStakes(
        await getStake(
          state.sdk_v2_client,
          AccountAddress.from(delegatorAddress),
          AccountAddress.from(validatorAddress),
        ),
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
