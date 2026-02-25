import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";

export type UserTransactionFunctionInfo = {
  signature: {function_info: string};
  version: number;
};

const USER_TXN_FUNCTION_INFO_QUERY = `
  query UserTransactionFunctionInfo($limit: Int, $sender: String) {
    user_transactions(limit: $limit, where: {sender: {_eq: $sender}}) {
      signature {
        function_info
      }
      version
    }
  }
`;

export function useGetUserTransactionFunctionInfo(
  limit: number,
  sender: string,
): {
  isLoading: boolean;
  error: Error | undefined;
  data: UserTransactionFunctionInfo[] | undefined;
} {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const {isLoading, error, data} = useQuery({
    queryKey: ["userTxnFunctionInfo", limit, sender, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions: UserTransactionFunctionInfo[];
      }>({
        query: {
          query: USER_TXN_FUNCTION_INFO_QUERY,
          variables: {limit, sender},
        },
      }),
  });

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: data?.user_transactions,
  };
}
