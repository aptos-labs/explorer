import {useCallback} from "react";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {VerificationStatus} from "../../constants";

export interface AptosVerificationResultDto {
  network: string;
  account: string;
  moduleName: string;
  errMsg?: string;
  status?: VerificationStatus;
  onChainByteCode?: string;
  compiledByteCode?: string;
}

const useVerificationRequester = () => {
  const [, , endpoint] = useGlobalState();

  return useCallback(
    async (body: {
      network: string;
      account: string;
      moduleName: string;
    }): Promise<AptosVerificationResultDto> => {
      const res = await fetch(endpoint, {
        method: "post",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Verification service is not working.");
      }
      return res.json();
    },
    [endpoint],
  );
};

export default useVerificationRequester;
