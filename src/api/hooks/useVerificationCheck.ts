import {useCallback} from "react";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {VerificationStatus} from "../../constants";

export interface AptosVerificationCheckDto {
  network: string;
  account: string;
  moduleName: string;
  status?: VerificationStatus;
  errMsg?: string;
}
const useVerificationChecker = () => {
  const [, , endpoint] = useGlobalState();

  return useCallback(
    async (params: {
      network: string;
      account: string;
      moduleName: string;
    }): Promise<AptosVerificationCheckDto> => {
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`${endpoint}?${queryString}`);
      if (!res.ok) {
        throw new Error("Verification service is not working.");
      }
      return res.json();
    },
    [endpoint],
  );
};

export default useVerificationChecker;
