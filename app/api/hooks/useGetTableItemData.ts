import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {useGetIsGraphqlClientSupported} from "./useGraphqlClient";

const TABLE_ITEMS_DATA_QUERY = `
  query TableItemsData($transaction_version: bigint!) {
    table_items(
      where: { transaction_version: { _eq: $transaction_version } }
    ) {
      decoded_key
      decoded_value
      key
      table_handle
      transaction_version
      write_set_change_index
    }
  }
`;

const TABLE_ITEMS_METADATA_QUERY = `
  query TableItemsMetadata($handles: [String!]!) {
    table_metadatas(
      where: { handle: { _in: $handles } }
    ) {
      handle
      key_type
      value_type
    }
  }
`;

export type IndexerTableItem = {
  decoded_key: string;
  decoded_value: string | null;
  key: string;
  table_handle: string;
  transaction_version: number;
  write_set_change_index: number;
};

export type IndexerTableMetadata = {
  handle: string;
  key_type: string;
  value_type: string;
};

type TableItemsDataResponse = {
  table_items: IndexerTableItem[];
};

type TableItemsMetadataResponse = {
  table_metadatas: IndexerTableMetadata[];
};

export function useGetTableItemsData(transactionVersion: string | undefined) {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const isGraphqlSupported = useGetIsGraphqlClientSupported();

  return useQuery({
    queryKey: ["tableItemsData", transactionVersion, networkValue],
    queryFn: () =>
      client.queryIndexer<TableItemsDataResponse>({
        query: {
          query: TABLE_ITEMS_DATA_QUERY,
          variables: {transaction_version: transactionVersion},
        },
      }),
    enabled: isGraphqlSupported && !!transactionVersion,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useGetTableItemsMetadata(handles: string[]) {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const isGraphqlSupported = useGetIsGraphqlClientSupported();

  return useQuery({
    queryKey: ["tableItemsMetadata", handles.sort().join(","), networkValue],
    queryFn: () =>
      client.queryIndexer<TableItemsMetadataResponse>({
        query: {
          query: TABLE_ITEMS_METADATA_QUERY,
          variables: {handles},
        },
      }),
    enabled: isGraphqlSupported && handles.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
