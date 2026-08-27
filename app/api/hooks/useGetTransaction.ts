import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClientV2, useNetworkValue} from "../../global-config";
import type {ResponseError} from "../client";
import {transactionQueryOptions} from "../queries";

export function useGetTransaction(
  txnHashOrVersion: string,
): UseQueryResult<Types.Transaction, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClientV2();

  return useQuery(
    transactionQueryOptions(txnHashOrVersion, aptosClient, networkValue),
  );
}
