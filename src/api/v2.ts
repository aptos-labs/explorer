import {withResponseError} from "./client";
import {Aptos, Block} from "@aptos-labs/ts-sdk";

export function getBlockByHeight(
  requestParameters: {height: number; withTransactions: boolean},
  aptos: Aptos,
): Promise<Block> {
  const {height, withTransactions} = requestParameters;
  return withResponseError(
    aptos.getBlockByHeight({blockHeight: height, options: {withTransactions}}),
  );
}

export function getBlockByVersion(
  requestParameters: {version: number; withTransactions: boolean},
  aptos: Aptos,
): Promise<Block> {
  const {version, withTransactions} = requestParameters;
  return withResponseError(
    aptos.getBlockByVersion({
      ledgerVersion: version,
      options: {withTransactions},
    }),
  );
}

export async function getRecentBlocks(
  currentBlockHeight: bigint | number,
  count: bigint | number,
  aptos: Aptos,
): Promise<Block[]> {
  const blockPromises = [];
  // Don't await here, or they'll be in serial
  for (let i = BigInt(0); i < BigInt(count); i++) {
    const block = aptos.getBlockByHeight({
      blockHeight: BigInt(currentBlockHeight) - i,
      options: {withTransactions: false}, // Always false, or this will take forever
    });
    blockPromises.push(block);
  }
  return Promise.all(blockPromises);
}
