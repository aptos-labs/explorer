import {useEffect, useState} from "react";
import {getAccount, getTransaction} from "../../api";
import {useGlobalState} from "../../GlobalState";
import {
  isValidAccountAddress,
  isValidTxnHashOrVersion,
} from "../../pages/utils";

export type SearchResult = {
  label: string;
  to: string | null;
};

const NOT_FOUND_RESULT = {
  label: "No Results",
  to: null,
};

export default function useGetSearchResults(input: string) {
  const [results, setResults] = useState<SearchResult[]>([]);

  const [state, _setState] = useGlobalState();

  const searchText = input.trim();

  useEffect(() => {
    if (searchText === "") return;

    const fetchData = async () => {
      const isValidAccountAddr = isValidAccountAddress(searchText);
      const isValidTxnHashOrVer = isValidTxnHashOrVersion(searchText);

      const accountPromise = getAccount(
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

      const promises = [];

      if (isValidAccountAddr) {
        promises.push(accountPromise);
      }
      if (isValidTxnHashOrVer) {
        promises.push(txnPromise);
      }

      const resultsList = await Promise.all(promises);
      const results = resultsList.filter(
        (result): result is SearchResult => !!result,
      );

      if (results.length === 0) {
        results.push(NOT_FOUND_RESULT);
      }

      setResults(results);
    };

    fetchData();
  }, [searchText]);

  return results;
}
