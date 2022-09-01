import {EvaluationSummary, NodeCheckerClient} from "aptos-node-checker-client";
import {GlobalState} from "../../GlobalState";

export const DEFAULT_NHC_INSTANCE =
  "https://node-checker.prod.gcp.aptosdev.com";

export const NHC_INSTANCE_OVERRIDES = {
  local: "http://127.0.0.1:20121",
};

export type NhcInstanceOverride = keyof typeof NHC_INSTANCE_OVERRIDES;

export function determineNhcUrl(state: GlobalState) {
  if (state.network_name in NHC_INSTANCE_OVERRIDES) {
    return NHC_INSTANCE_OVERRIDES[state.network_name as NhcInstanceOverride];
  }
  return DEFAULT_NHC_INSTANCE;
}

function getClient(url: string) {
  return new NodeCheckerClient({
    BASE: url,
  });
}

export async function checkNode({
  nhcUrl,
  nodeUrl,
  baselineConfigurationName,
  apiPort,
}: {
  nhcUrl: string;
  nodeUrl: string;
  baselineConfigurationName?: string | undefined;
  apiPort?: number | undefined;
}): Promise<EvaluationSummary> {
  const client = getClient(nhcUrl);
  return client.default.getCheckNode({
    nodeUrl,
    apiPort,
    baselineConfigurationName,
  });
}

// Return map of pretty name to key.
export async function getConfigurationKeys({
  nhcUrl,
}: {
  nhcUrl: string;
}): Promise<Map<string, string>> {
  const client = getClient(nhcUrl);
  let keys = await client.default.getGetConfigurationKeys();
  keys.sort((a, b) => b.key.localeCompare(a.key));
  return new Map<string, string>(
    keys.map((key) => {
      return [key.pretty_name, key.key];
    }),
  );
}
