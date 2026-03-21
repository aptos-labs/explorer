import {useMutation} from "@tanstack/react-query";
import {fetchTokenFlowEdgesFromIndexer} from "../accountTokenFlowGraphFetch";
import type {FetchTokenFlowGraphInput} from "../accountTokenFlowGraphFetch";
import {useSdkV2Client} from "../../global-config";

export function useAccountTokenFlowGraphMutation() {
  const client = useSdkV2Client();
  return useMutation({
    mutationFn: (input: FetchTokenFlowGraphInput) =>
      fetchTokenFlowEdgesFromIndexer(client, input),
  });
}
