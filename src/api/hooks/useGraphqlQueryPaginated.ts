import {Aptos} from "@aptos-labs/ts-sdk";
import {useQuery} from "@tanstack/react-query";

export function useGraphqlQueryPaginated(
  aptos: Aptos,
  query: string,
  page: number,
  pageSize: number,
  variables: object,
) {
  return useQuery({
    queryKey: ["page", query, page, pageSize, variables],
    queryFn: async () => {
      return aptos.queryIndexer({
        query: {
          query,
          variables: {
            ...variables,
            limit: pageSize,
            offset: page * pageSize,
          },
        },
      });
    },
  });
}

export function useGraphqlQueryAll<T extends object>(
  aptos: Aptos,
  query: string,
  pageSize: number,
  maxPages: number,
  variables: object,
) {
  // Parallelize the queries
  return useQuery<T[], Error>({
    queryKey: ["all", query, pageSize, maxPages, variables],
    queryFn: async () => {
      const pages = [];
      for (let i = 0; i < maxPages; i++) {
        pages.push(
          aptos.queryIndexer({
            query: {
              query,
              variables: {
                ...variables,
                limit: pageSize,
                offset: i * pageSize,
              },
            },
          }),
        );
      }

      const responses = (await Promise.all(pages)) as T[];
      console.log("responses", responses.length);
      return responses;
    },
  });
}
