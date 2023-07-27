import {useEffect, useState} from "react";
import {
  getAccount,
  getAccountResources,
  getBlockByHeight,
  getBlockByVersion,
  getTransaction,
} from "../../api";
import {GTMEvents} from "../../dataConstants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  isNumeric,
  isValidAccountAddress,
  isValidTxnHashOrVersion,
  truncateAddress,
} from "../../pages/utils";
import {getAddressFromName} from "./useGetANS";
import {sendToGTM} from "./useGoogleTagManager";

export type SearchResult = {
  label: string;
  to: string | null;
};

export const NotFoundResult: SearchResult = {
  label: "No Results",
  to: null,
};

export default function useGetSearchResults(input: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, _setState] = useGlobalState();

  const searchText = input.trim();

  useEffect(() => {
    if (searchText === "") {
      setResults([NotFoundResult]);
      return;
    }

    const fetchData = async () => {
      const searchPerformanceStart = GTMEvents.SEARCH_STATS + " start";
      const searchPerformanceEnd = GTMEvents.SEARCH_STATS + " end";
      window.performance.mark(searchPerformanceStart);

      const isValidAccountAddr = isValidAccountAddress(searchText);
      const isValidTxnHashOrVer = isValidTxnHashOrVersion(searchText);
      const isValidBlockHeightOrVer = isNumeric(searchText);

      const promises = [];

      const namePromise = getAddressFromName(searchText, state.network_name)
        .then(({address, primaryName}): SearchResult | null => {
          if (address) {
            return {
              label: `Account ${truncateAddress(address)}${
                primaryName ? ` | ${primaryName}.apt` : ``
              }`,
              to: `/account/${address}`,
            };
          } else {
            return null;
          }
        })
        .catch(() => {
          return null;
          // Do nothing. It's expected that not all search input is a valid transaction
        });
      promises.push(namePromise);

      if (isValidAccountAddr) {
        // It's either an account OR an object: we query both at once to save time
        const accountPromise = await getAccount(
          {address: searchText},
          state.network_value,
        )
          .then((): SearchResult => {
            return {
              label: `Account ${searchText}`,
              to: `/account/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid account
          });

        const resourcePromise = await getAccountResources(
          {address: searchText},
          state.network_value,
        )
          .then((): SearchResult => {
            return {
              label: `Object ${searchText}`,
              to: `/object/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid account
          });
        promises.push(accountPromise);
        promises.push(resourcePromise);
      }

      if (isValidTxnHashOrVer) {
        const txnPromise = getTransaction(
          {txnHashOrVersion: searchText},
          state.network_value,
        )
          .then((): SearchResult => {
            return {
              label: `Transaction ${searchText}`,
              to: `/txn/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid transaction
          });
        promises.push(txnPromise);
      }

      if (isValidBlockHeightOrVer) {
        const blockByHeightPromise = getBlockByHeight(
          {height: parseInt(searchText), withTransactions: false},
          state.network_value,
        )
          .then((): SearchResult => {
            return {
              label: `Block ${searchText}`,
              to: `/block/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid transaction
          });

        const blockByVersionPromise = getBlockByVersion(
          {version: parseInt(searchText), withTransactions: false},
          state.network_value,
        )
          .then((block): SearchResult => {
            return {
              label: `Block with Txn Version ${searchText}`,
              to: `/block/${block.block_height}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid transaction
          });
        promises.push(blockByHeightPromise);
        promises.push(blockByVersionPromise);
      }

      const resultsList = await Promise.all(promises);
      const results = resultsList.filter(
        (result): result is SearchResult => !!result,
      );

      window.performance.mark(searchPerformanceEnd);
      sendToGTM({
        dataLayer: {
          event: GTMEvents.SEARCH_STATS,
          network: state.network_name,
          searchText: searchText,
          searchResult: results.length === 0 ? "notFound" : "success",
          duration: window.performance.measure(
            GTMEvents.SEARCH_STATS,
            searchPerformanceStart,
            searchPerformanceEnd,
          ).duration,
        },
      });
      if (results.length === 0) {
        results.push(NotFoundResult);
      }

      setResults(results);
    };

    fetchData();
  }, [searchText, state]);

  return results;
}
