import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {CombinedGraphQLErrors, gql} from "@apollo/client";

export type UserTransactionFunctionInfo = {
  signature: {function_info: string};
  version: number;
};

export function useGetUserTransactionFunctionInfo(
  limit: number,
  sender: string,
): {
  isLoading: boolean;
  error: CombinedGraphQLErrors | undefined;
  data: UserTransactionFunctionInfo[] | undefined;
} {
  const {loading, error, data} = useGraphqlQuery<{
    user_transactions: UserTransactionFunctionInfo[];
  }>(
    gql`
      query UserTransactionFunctionInfo($limit: Int, $sender: String) {
        user_transactions(limit: $limit, where: {sender: {_eq: $sender}}) {
          signature {
            function_info
          }
          version
        }
      }
    `,
    {
      variables: {
        limit,
        sender,
      },
    },
  );

  return {
    isLoading: loading,
    error: error ? (error as CombinedGraphQLErrors) : undefined,
    data: data?.user_transactions,
  };
}
