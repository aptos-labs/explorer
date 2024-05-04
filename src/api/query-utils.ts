import {UseQueryResult} from "@tanstack/react-query";
import {ResponseError} from "./client";

type CombinedQueryResultState = {
  isLoading: boolean;
  error: ResponseError | null;
};

/**
 * Combines multiple react-query queries into a single query state.
 * This is useful if your component needs to make multiple API calls concurrently in order to render the desires data.
 * @param queries
 * @returns
 * @example
 * const {
 *  combinedQueryState: {error, isLoading}},
 *  queries: [query1, query2, query3],
 * } = combineQueries([
 * useQuery(...),
 * useQuery(...),
 * useQuery(...),
 * ]);
 */
export function combineQueries<
  T extends UseQueryResult<unknown, ResponseError>[],
>(queries: [...T]): {combinedQueryState: CombinedQueryResultState; queries: T} {
  const error = queries.find((query) => query.isError)?.error;
  const isLoading = queries.some((query) => query.isLoading);
  return {combinedQueryState: {error: error ?? null, isLoading}, queries};
}
