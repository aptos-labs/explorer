import {createContext} from "react";
import {ValidatorData} from "../../../api/hooks/useGetValidators";
import {MoveResource} from "@aptos-labs/ts-sdk";

type DelegationState = {
  accountResource: MoveResource | undefined;
  validator: ValidatorData | undefined;
};

const defaultDelegationState: DelegationState = {
  accountResource: undefined,
  validator: undefined,
};

export const DelegationStateContext = createContext(
  defaultDelegationState || null,
);
