import {
  AptosConfig,
  type Client,
  type ClientRequest,
  type ClientResponse,
  Network,
} from "@aptos-labs/ts-sdk";
import {classifyRpcUrl, extractRpcPath, recordRpcRequest} from "./rpcMonitor";

type Provider = Client["provider"];

let defaultProvider: Provider | undefined;

function getDefaultAptosProvider(): Provider {
  if (!defaultProvider) {
    defaultProvider = new AptosConfig({network: Network.MAINNET}).client
      .provider;
  }
  return defaultProvider;
}

/**
 * Wraps the Aptos HTTP client provider to log and count every SDK RPC call.
 */
export function createMonitoredProvider(inner?: Provider): Provider {
  const base = inner ?? getDefaultAptosProvider();

  return async function monitoredProvider<Req, Res>(
    requestOptions: ClientRequest<Req>,
  ): Promise<ClientResponse<Res>> {
    const startedAt =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const api = classifyRpcUrl(requestOptions.url);
    const path = extractRpcPath(requestOptions.url);

    try {
      const response = await base<Req, Res>(requestOptions);
      const durationMs =
        (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        startedAt;

      recordRpcRequest({
        source: "sdk",
        api,
        method: requestOptions.method,
        path,
        url: requestOptions.url,
        originMethod: requestOptions.originMethod,
        status:
          response.status >= 200 && response.status < 300 ? "success" : "error",
        statusCode: response.status,
        durationMs,
      });

      return response;
    } catch (err) {
      const durationMs =
        (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        startedAt;

      recordRpcRequest({
        source: "sdk",
        api,
        method: requestOptions.method,
        path,
        url: requestOptions.url,
        originMethod: requestOptions.originMethod,
        status: "error",
        durationMs,
      });

      throw err;
    }
  };
}
