import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";

export type ModulePublishTransaction = {
  version: number;
  sender: string;
  timestamp: string;
  entry_function_id_str: string;
};

const MODULE_PUBLISH_HISTORY_QUERY = `
  query ModulePublishHistory($sender: String, $limit: Int, $offset: Int) {
    user_transactions(
      where: {
        sender: {_eq: $sender}
        entry_function_id_str: {_eq: "0x1::code::publish_package_txn"}
      }
      order_by: {version: desc}
      limit: $limit
      offset: $offset
    ) {
      version
      sender
      timestamp
      entry_function_id_str
    }
  }
`;

export function useGetModulePublishHistory(
  address: string,
  limit = 50,
  offset = 0,
): {
  isLoading: boolean;
  error: Error | undefined;
  data: ModulePublishTransaction[] | undefined;
} {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: ["modulePublishHistory", addr64Hash, limit, offset, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions: ModulePublishTransaction[];
      }>({
        query: {
          query: MODULE_PUBLISH_HISTORY_QUERY,
          variables: {sender: addr64Hash, limit, offset},
        },
      }),
    enabled: !!addr64Hash,
  });

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: data?.user_transactions,
  };
}
