import {
  Aptos,
  AptosConfig,
  type ClientConfig,
  Network as SdkNetwork,
} from "@aptos-labs/ts-sdk";
import type {NetworkName} from "../lib/constants";
import {createMonitoredProvider} from "./monitoredAptosProvider";

export function networkNameToSdkNetwork(networkName: NetworkName): SdkNetwork {
  switch (networkName) {
    case "mainnet":
      return SdkNetwork.MAINNET;
    case "testnet":
      return SdkNetwork.TESTNET;
    case "devnet":
      return SdkNetwork.DEVNET;
    default:
      return SdkNetwork.CUSTOM;
  }
}

export type MonitoredAptosClientOptions = {
  networkName: NetworkName;
  nodeUrl: string;
  indexerUri?: string;
  clientConfig?: ClientConfig;
};

/**
 * Creates an Aptos SDK client whose HTTP provider records every RPC request.
 */
export function createMonitoredAptosClient(
  options: MonitoredAptosClientOptions,
): Aptos {
  const config = new AptosConfig({
    network: networkNameToSdkNetwork(options.networkName),
    fullnode: options.nodeUrl,
    indexer: options.indexerUri,
    clientConfig: options.clientConfig,
    client: {
      provider: createMonitoredProvider(),
    },
  });

  return new Aptos(config);
}
