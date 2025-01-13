import {AptosClient, Types} from "aptos";
import {OCTA} from "../constants";
import {isNumeric} from "../pages/utils";
import {sortTransactions} from "../utils";
import {withResponseError} from "./client";
import {
  AccountAddressInput,
  Aptos,
  APTOS_COIN,
  InputViewFunctionData,
  TypeTagAddress,
  TypeTagU64,
} from "@aptos-labs/ts-sdk";

export async function getTransactions(
  requestParameters: {start?: number; limit?: number},
  client: AptosClient,
): Promise<Types.Transaction[]> {
  const {start, limit} = requestParameters;
  let bigStart;
  if (start !== undefined) {
    bigStart = BigInt(start);
  }
  const transactions = await withResponseError(
    client.getTransactions({start: bigStart, limit}),
  );

  // Sort in descending order
  transactions.sort(sortTransactions);

  return transactions;
}

export async function getAccountTransactions(
  requestParameters: {address: string; start?: number; limit?: number},
  client: AptosClient,
): Promise<Types.Transaction[]> {
  const {address, start, limit} = requestParameters;
  let bigStart;
  if (start !== undefined) {
    bigStart = BigInt(start);
  }
  const transactions = await withResponseError(
    client.getAccountTransactions(address, {start: bigStart, limit}),
  );

  // Sort in descending order
  transactions.sort(sortTransactions);

  return transactions;
}

export function getTransaction(
  requestParameters: {txnHashOrVersion: string | number},
  client: AptosClient,
): Promise<Types.Transaction> {
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
  client: AptosClient,
): Promise<Types.Transaction> {
  return withResponseError(client.getTransactionByVersion(BigInt(version)));
}

function getTransactionByHash(
  hash: string,
  client: AptosClient,
): Promise<Types.Transaction> {
  return withResponseError(client.getTransactionByHash(hash));
}

export function getLedgerInfo(
  client: AptosClient,
): Promise<Types.IndexResponse> {
  return withResponseError(client.getLedgerInfo());
}

export function getLedgerInfoWithoutResponseError(
  nodeUrl: string,
): Promise<Types.IndexResponse> {
  // This is a special case where we don't use the pre-existing client. This means we
  // do not attach an API key to the request, but it's okay for just this request to be
  // sent anonymously.
  const client = new AptosClient(nodeUrl);
  return client.getLedgerInfo();
}

export function getAccount(
  requestParameters: {address: string},
  client: AptosClient,
): Promise<Types.AccountData> {
  const {address} = requestParameters;
  return withResponseError(client.getAccount(address));
}

export function getAccountResources(
  requestParameters: {address: string; ledgerVersion?: number},
  client: AptosClient,
): Promise<Types.MoveResource[]> {
  const {address, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResources(address, {ledgerVersion: ledgerVersionBig}),
  );
}

export function getAccountResource(
  requestParameters: {
    address: string;
    resourceType: string;
    ledgerVersion?: number;
  },
  client: AptosClient,
): Promise<Types.MoveResource> {
  const {address, resourceType, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResource(address, resourceType, {
      ledgerVersion: ledgerVersionBig,
    }),
  );
}

export function getAccountModules(
  requestParameters: {address: string; ledgerVersion?: number},
  client: AptosClient,
): Promise<Types.MoveModuleBytecode[]> {
  const {address, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountModules(address, {ledgerVersion: ledgerVersionBig}),
  );
}

export function getAccountModule(
  requestParameters: {
    address: string;
    moduleName: string;
    ledgerVersion?: number;
  },
  client: AptosClient,
): Promise<Types.MoveModuleBytecode> {
  const {address, moduleName, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountModule(address, moduleName, {
      ledgerVersion: ledgerVersionBig,
    }),
  );
}

export function view(
  request: Types.ViewRequest,
  client: AptosClient,
  ledgerVersion?: string,
): Promise<Types.MoveValue[]> {
  let parsedVersion = ledgerVersion;

  // Handle non-numbers, to default to the latest ledger version
  if (typeof ledgerVersion === "string" && isNaN(parseInt(ledgerVersion, 10))) {
    parsedVersion = undefined;
  }

  return client.view(request, parsedVersion);
}

export function getTableItem(
  requestParameters: {tableHandle: string; data: Types.TableItemRequest},
  client: AptosClient,
): Promise<any> {
  const {tableHandle, data} = requestParameters;
  return withResponseError(client.getTableItem(tableHandle, data));
}

export async function getRecentBlocks(
  currentBlockHeight: number,
  count: number,
  client: AptosClient,
): Promise<Types.Block[]> {
  const blockPromises = [];
  // Don't await here, or they'll be in serial
  for (let i = 0; i < count; i++) {
    const block = client.getBlockByHeight(currentBlockHeight - i, false);
    blockPromises.push(block);
  }
  return Promise.all(blockPromises);
}

export async function getBalance(
  client: Aptos,
  address: AccountAddressInput,
  coinType?: `0x${string}::${string}::${string}`,
): Promise<string> {
  const typeArguments = coinType ? [coinType] : [APTOS_COIN];

  // TODO: Replace with native SDK call
  const payload: InputViewFunctionData = {
    function: "0x1::coin::balance",
    typeArguments,
    functionArguments: [address],
    abi: {
      parameters: [new TypeTagAddress()],
      typeParameters: [{constraints: []}],
      returnTypes: [new TypeTagU64()],
    },
  };
  return withResponseError(
    client.view<[string]>({payload}).then((res) => res[0]),
  );
}

export async function getStake(
  client: AptosClient,
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::get_stake",
    type_arguments: [],
    arguments: [validatorAddress, delegatorAddress],
  };
  return withResponseError(client.view(payload));
}

export async function getValidatorCommission(
  client: AptosClient,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::operator_commission_percentage",
    type_arguments: [],
    arguments: [validatorAddress],
  };
  return withResponseError(client.view(payload));
}

export async function getValidatorCommissionChange(
  client: AptosClient,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function:
      "0x1::delegation_pool::operator_commission_percentage_next_lockup_cycle",
    type_arguments: [],
    arguments: [validatorAddress],
  };
  return withResponseError(client.view(payload));
}

// Return whether `pending_inactive` stake can be directly withdrawn from the delegation pool,
// for the edge case when the validator had gone inactive before its lockup expired.
export async function getCanWithdrawPendingInactive(
  client: AptosClient,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::can_withdraw_pending_inactive",
    type_arguments: [],
    arguments: [validatorAddress],
  };
  return withResponseError(client.view(payload));
}

export async function getAddStakeFee(
  client: AptosClient,
  validatorAddress: Types.Address,
  amount: string,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::get_add_stake_fee",
    type_arguments: [],
    arguments: [validatorAddress, (Number(amount) * OCTA).toString()],
  };
  return withResponseError(client.view(payload));
}

export async function getValidatorState(
  client: AptosClient,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::stake::get_validator_state",
    type_arguments: [],
    arguments: [validatorAddress],
  };
  return withResponseError(client.view(payload));
}

export async function getValidatorCommissionAndState(
  client: AptosClient,
  validatorAddresses: Types.Address[],
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function:
      "0x7a5c34e80f796fe58c336812f80e15a86a2086c75640270a11207b911d512aba::helpers::pool_address_info",
    type_arguments: [],
    arguments: [validatorAddresses],
  };
  return withResponseError(client.view(payload));
}
