import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import type {ResponseError} from "../client";
import {transactionQueryOptions} from "../queries";

export function useGetTransaction(
  txnHashOrVersion: string,
): UseQueryResult<Types.Transaction, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useSdkV2Client();

  return useQuery(
    transactionQueryOptions(txnHashOrVersion, aptosClient, networkValue),
  );
}
