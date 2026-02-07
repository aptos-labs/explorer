import {useQuery} from "@tanstack/react-query";
import {gql} from "graphql-request";
import {useGetGraphqlClient} from "./useGraphqlClient";

export type UserTransactionFunctionInfo = {
  signature: {function_info: string};
  version: number;
};

const USER_TXN_FUNCTION_INFO_QUERY = gql`
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
  const client = useGetGraphqlClient();
  const {isLoading, error, data} = useQuery({
    queryKey: ["userTxnFunctionInfo", limit, sender],
    queryFn: () =>
      client.request<{
        user_transactions: UserTransactionFunctionInfo[];
      }>(USER_TXN_FUNCTION_INFO_QUERY, {limit, sender}),
  });

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: data?.user_transactions,
  };
}
