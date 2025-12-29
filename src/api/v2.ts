import {withResponseError} from "./client";
import {Types} from "aptos";
import {Aptos, Block, AccountAddress} from "@aptos-labs/ts-sdk";
import {isNumeric} from "../pages/utils";

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

/**
 * Get account info using SDK v2
 */
export async function getAccountV2(
  requestParameters: {address: string},
  aptos: Aptos,
): Promise<Types.AccountData> {
  const {address} = requestParameters;
  const accountAddress = AccountAddress.from(address, {maxMissingChars: 63});
  if (!accountAddress) {
    throw new Error(`Invalid address: ${address}`);
  }
  const accountInfo = await withResponseError(
    aptos.getAccountInfo({accountAddress}),
  );
  // Convert to old format for compatibility
  return {
    sequence_number: accountInfo.sequence_number.toString(),
    authentication_key: accountInfo.authentication_key.toString(),
  } as Types.AccountData;
}

/**
 * Get account resources using SDK v2
 */
export async function getAccountResourcesV2(
  requestParameters: {address: string; ledgerVersion?: number},
  aptos: Aptos,
): Promise<Types.MoveResource[]> {
  const {address, ledgerVersion} = requestParameters;
  const accountAddress = AccountAddress.from(address, {maxMissingChars: 63});
  if (!accountAddress) {
    throw new Error(`Invalid address: ${address}`);
  }
  const resources = await withResponseError(
    aptos.getAccountResources({
      accountAddress,
      options: {
        ledgerVersion:
          ledgerVersion !== undefined ? BigInt(ledgerVersion) : undefined,
      },
    }),
  );
  // Convert to old format for compatibility
  return resources as unknown as Types.MoveResource[];
}

/**
 * Get account resource using SDK v2
 */
export async function getAccountResourceV2(
  requestParameters: {
    address: string;
    resourceType: string;
    ledgerVersion?: number;
  },
  aptos: Aptos,
): Promise<Types.MoveResource> {
  const {address, resourceType, ledgerVersion} = requestParameters;
  const accountAddress = AccountAddress.from(address, {maxMissingChars: 63});
  if (!accountAddress) {
    throw new Error(`Invalid address: ${address}`);
  }
  const resource = await withResponseError(
    aptos.getAccountResource({
      accountAddress,
      resourceType: resourceType as `0x${string}::${string}::${string}`,
      options: {
        ledgerVersion:
          ledgerVersion !== undefined ? BigInt(ledgerVersion) : undefined,
      },
    }),
  );
  // Convert to old format for compatibility
  return resource as unknown as Types.MoveResource;
}

/**
 * Get transaction using SDK v2
 */
export async function getTransactionV2(
  requestParameters: {txnHashOrVersion: string | number},
  aptos: Aptos,
): Promise<Types.Transaction> {
  const {txnHashOrVersion} = requestParameters;
  if (typeof txnHashOrVersion === "number" || isNumeric(txnHashOrVersion)) {
    const version =
      typeof txnHashOrVersion === "number"
        ? txnHashOrVersion
        : parseInt(txnHashOrVersion);
    const txn = await withResponseError(
      aptos.getTransactionByVersion({ledgerVersion: version}),
    );
    // Convert to old format for compatibility
    return txn as unknown as Types.Transaction;
  } else {
    const txn = await withResponseError(
      aptos.getTransactionByHash({transactionHash: txnHashOrVersion}),
    );
    // Convert to old format for compatibility
    return txn as unknown as Types.Transaction;
  }
}
