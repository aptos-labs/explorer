import {useQuery} from "@tanstack/react-query";
import {getAccountTransactions} from "../../../api";
import {useGetAccountAPTBalance} from "../../../api/hooks/useGetAccountAPTBalance";
import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import {
  useAptosClient,
  useNetworkValue,
  useSdkV2Client,
} from "../../../global-config";
import {tryStandardizeAddress} from "../../../utils";
import {
  type AccountOnChainActivity,
  activityFromIndexer,
  type IndexerActivityResponse,
  resolveAccountActivity,
} from "../utils/accountInfo";

const ACCOUNT_ACTIVITY_QUERY = `
  query AccountOnChainActivity($address: String) {
    balances: current_fungible_asset_balances(
      where: {owner_address: {_eq: $address}, amount: {_gt: "0"}}
      limit: 1
    ) {
      amount
    }
    sent: user_transactions(
      where: {sender: {_eq: $address}}
      limit: 1
    ) {
      version
    }
  }
`;

/**
 * Whether an address with no Account resource still has on-chain activity.
 * Funds are a positive fungible-asset balance (indexer) or a positive APT
 * coin balance. Sent transactions are indexer user transactions, with the
 * REST account-transactions list as a fallback when the indexer is unavailable.
 */
export function useAccountOnChainActivity(
  address: string,
  enabled: boolean,
): {pending: boolean; activity: AccountOnChainActivity | undefined} {
  const graphqlSupported = useGetIsGraphqlClientSupported();
  const sdkV2Client = useSdkV2Client();
  const aptosClient = useAptosClient();
  const networkValue = useNetworkValue();
  const standardizedAddress = tryStandardizeAddress(address);

  const indexerQuery = useQuery({
    queryKey: ["accountOnChainActivity", standardizedAddress, networkValue],
    queryFn: async () => {
      const response = await sdkV2Client.queryIndexer<IndexerActivityResponse>({
        query: {
          query: ACCOUNT_ACTIVITY_QUERY,
          variables: {address: standardizedAddress},
        },
      });
      return activityFromIndexer(response);
    },
    enabled: enabled && graphqlSupported && !!standardizedAddress,
    staleTime: 30 * 1000,
    retry: false,
  });

  const aptBalance = useGetAccountAPTBalance(address);

  const restNeeded =
    enabled && !!address && (!graphqlSupported || indexerQuery.isError);

  const restQuery = useQuery({
    queryKey: ["accountHasSentRest", {address}, networkValue],
    queryFn: async () => {
      const transactions = await getAccountTransactions(
        {address, limit: 1},
        aptosClient,
      );
      return transactions.length > 0;
    },
    enabled: restNeeded,
    staleTime: 30 * 1000,
    retry: false,
  });

  return resolveAccountActivity({
    enabled,
    graphqlSupported,
    indexer: indexerQuery.data,
    indexerPending: indexerQuery.isLoading,
    indexerError: indexerQuery.isError,
    aptBalance: aptBalance.data,
    aptPending: aptBalance.isLoading,
    restSent: restQuery.data,
    restPending: restNeeded && restQuery.isLoading,
  });
}
