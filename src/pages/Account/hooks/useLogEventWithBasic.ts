import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Statsig} from "statsig-react";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {getStableID} from "../../../utils";

// Log event with basic info
export const useLogEventWithBasic = () => {
  const {account} = useWallet();
  const [state] = useGlobalState();

  return (
    eventName: string,
    value?: string | number | null,
    extraMetadata?: Record<string, string> | null,
  ) => {
    const metadata = {
      stable_id: getStableID(),
      wallet_address: account?.address ?? "",
      network_type: state.network_name,
      ...extraMetadata,
    };

    if (Statsig.initializeCalled()) {
      Statsig.logEvent(eventName, value, metadata);
    }
  };
};
