import {Types} from "aptos";
import {createContext} from "react";
import {ValidatorData} from "../../../api/hooks/useGetValidators";

type DelegationState = {
  accountResource: Types.MoveResource | undefined;
  validator: ValidatorData | undefined;
};

const defaultDelegationState: DelegationState = {
  accountResource: undefined,
  validator: undefined,
};

export const DelegationStateContext = createContext(
  defaultDelegationState || null,
);
