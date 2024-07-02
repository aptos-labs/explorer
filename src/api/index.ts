import {
  AccountAddress,
  AccountData,
  Aptos,
  AptosConfig,
  Block,
  LedgerInfo,
  MoveModuleBytecode,
  MoveResource,
  MoveValue,
  TableItemRequest,
  TransactionResponse,
  ViewFunctionJsonPayload,
} from "@aptos-labs/ts-sdk";
import {OCTA} from "../constants";
import {isNumeric} from "../pages/utils";
import {sortTransactions} from "../utils";
import {withResponseError} from "./client";

export async function getTransactions(
  requestParameters: {start?: number; limit?: number},
  client: Aptos,
): Promise<TransactionResponse[]> {
  const {start, limit} = requestParameters;
  const transactions = await withResponseError(
    client.getTransactions({options: {offset: start, limit}}),
  );

  // Sort in descending order
  transactions.sort(sortTransactions);

  return transactions;
}

export async function getAccountTransactions(
  requestParameters: {address: AccountAddress; start?: number; limit?: number},
  client: Aptos,
): Promise<TransactionResponse[]> {
  const {address, start, limit} = requestParameters;
  const transactions = await withResponseError(
    client.getAccountTransactions({
      accountAddress: address,
      options: {offset: start, limit},
    }),
  );

  // Sort in descending order
  transactions.sort(sortTransactions);

  return transactions;
}

export function getTransaction(
  requestParameters: {txnHashOrVersion: string | number},
  client: Aptos,
): Promise<TransactionResponse> {
  const {txnHashOrVersion} = requestParameters;
  if (typeof txnHashOrVersion === "number" || isNumeric(txnHashOrVersion)) {
    const version =
      typeof txnHashOrVersion === "number"
        ? txnHashOrVersion
        : parseInt(txnHashOrVersion);
    return getTransactionByVersion(version, client);
  } else {
    return getTransactionByHash(txnHashOrVersion as string, client);
  }
}

function getTransactionByVersion(
  version: number,
  client: Aptos,
): Promise<TransactionResponse> {
  return withResponseError(
    client.getTransactionByVersion({ledgerVersion: version}),
  );
}

function getTransactionByHash(
  hash: string,
  client: Aptos,
): Promise<TransactionResponse> {
  return withResponseError(
    client.getTransactionByHash({transactionHash: hash}),
  );
}

export function getLedgerInfo(client: Aptos): Promise<LedgerInfo> {
  return withResponseError(client.getLedgerInfo());
}

export function getLedgerInfoWithoutResponseError(
  nodeUrl: string,
): Promise<LedgerInfo> {
  // This is a special case where we don't use the pre-existing client. This means we
  // do not attach an API key to the request, but it's okay for just this request to be
  // sent anonymously.
  const client = new Aptos(new AptosConfig({fullnode: nodeUrl}));
  return client.getLedgerInfo();
}

export function getAccount(
  requestParameters: {address: AccountAddress},
  client: Aptos,
): Promise<AccountData> {
  const {address} = requestParameters;
  return withResponseError(client.getAccountInfo({accountAddress: address}));
}

export function getAccountResources(
  requestParameters: {address: AccountAddress; ledgerVersion?: number},
  client: Aptos,
): Promise<MoveResource[]> {
  const {address, ledgerVersion} = requestParameters;

  return withResponseError(
    client.getAccountResources({
      accountAddress: address,
      options: {ledgerVersion},
    }),
  );
}

export function getAccountResource(
  requestParameters: {
    address: AccountAddress;
    resourceType: string;
    ledgerVersion?: number;
  },
  client: Aptos,
): Promise<MoveResource> {
  const {address, resourceType, ledgerVersion} = requestParameters;
  return withResponseError(
    client.getAccountResource({
      accountAddress: address,
      resourceType: resourceType as "${string}::${string}::${string}", // TODO: This is super annoying
      options: {ledgerVersion},
    }),
  );
}

export function getAccountModules(
  requestParameters: {address: AccountAddress; ledgerVersion?: number},
  client: Aptos,
): Promise<MoveModuleBytecode[]> {
  const {address, ledgerVersion} = requestParameters;
  return withResponseError(
    client.getAccountModules({
      accountAddress: address,
      options: {ledgerVersion},
    }),
  );
}

export function getAccountModule(
  requestParameters: {
    address: AccountAddress;
    moduleName: string;
    ledgerVersion?: number;
  },
  client: Aptos,
): Promise<MoveModuleBytecode> {
  const {address, moduleName, ledgerVersion} = requestParameters;
  return withResponseError(
    client.getAccountModule({
      accountAddress: address,
      moduleName,
      options: {ledgerVersion},
    }),
  );
}

export function view(
  request: ViewFunctionJsonPayload,
  client: Aptos,
  ledgerVersion?: string,
): Promise<MoveValue[]> {
  let lookupVersion: number | undefined;

  // Handle non-numbers, to default to the latest ledger version
  if (typeof ledgerVersion === "string") {
    const parsedVersion = parseInt(ledgerVersion, 10);

    if (!isNaN(parsedVersion)) {
      lookupVersion = parsedVersion;
    }
  }

  return client.viewJson({
    payload: request,
    options: {ledgerVersion: lookupVersion},
  });
}

export function getTableItem(
  requestParameters: {tableHandle: string; data: TableItemRequest},
  client: Aptos,
): Promise<any> {
  const {tableHandle, data} = requestParameters;
  return withResponseError(client.getTableItem({handle: tableHandle, data}));
}

export function getBlockByHeight(
  requestParameters: {height: number; withTransactions: boolean},
  client: Aptos,
): Promise<Block> {
  const {height, withTransactions} = requestParameters;
  return withResponseError(
    client.getBlockByHeight({blockHeight: height, options: {withTransactions}}),
  );
}

export function getBlockByVersion(
  requestParameters: {version: number; withTransactions: boolean},
  client: Aptos,
): Promise<Block> {
  const {version, withTransactions} = requestParameters;
  return withResponseError(
    client.getBlockByVersion({
      ledgerVersion: version,
      options: {withTransactions},
    }),
  );
}

export async function getRecentBlocks(
  currentBlockHeight: number,
  count: number,
  client: Aptos,
): Promise<Block[]> {
  const blocks = [];
  for (let i = 0; i < count; i++) {
    const block = await getBlockByHeight(
      {height: currentBlockHeight - i, withTransactions: false},
      client,
    );
    blocks.push(block);
  }
  return blocks;
}

export async function getStake(
  client: Aptos,
  delegatorAddress: AccountAddress,
  validatorAddress: AccountAddress,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::delegation_pool::get_stake" as "${string}::${string}::${string}", // TODO: still annoying
    typeArguments: [],
    functionArguments: [
      validatorAddress.toStringLong(),
      delegatorAddress.toStringLong(),
    ],
  };
  return view(payload, client);
}

export async function getValidatorCommission(
  client: Aptos,
  validatorAddress: string,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::delegation_pool::operator_commission_percentage" as "${string}::${string}::${string}",
    typeArguments: [],
    functionArguments: [validatorAddress.toString()],
  };
  return view(payload, client);
}

export async function getValidatorCommissionChange(
  client: Aptos,
  validatorAddress: string,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::delegation_pool::operator_commission_percentage_next_lockup_cycle" as "${string}::${string}::${string}",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return view(payload, client);
}

export async function getDelegationPoolExist(
  client: Aptos,
  validatorAddress: string,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::delegation_pool::delegation_pool_exists" as "${string}::${string}::${string}",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return view(payload, client);
}

// Return whether `pending_inactive` stake can be directly withdrawn from the delegation pool,
// for the edge case when the validator had gone inactive before its lockup expired.
export async function getCanWithdrawPendingInactive(
  client: Aptos,
  validatorAddress: string,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::delegation_pool::can_withdraw_pending_inactive" as "${string}::${string}::${string}",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return view(payload, client);
}

export async function getAddStakeFee(
  client: Aptos,
  validatorAddress: string,
  amount: string,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::delegation_pool::get_add_stake_fee" as "${string}::${string}::${string}",
    typeArguments: [],
    functionArguments: [validatorAddress, (Number(amount) * OCTA).toString()],
  };
  return view(payload, client);
}

export async function getValidatorState(
  client: Aptos,
  validatorAddress: string,
): Promise<MoveValue[]> {
  const payload = {
    function:
      "0x1::stake::get_validator_state" as "${string}::${string}::${string}",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return view(payload, client);
}
