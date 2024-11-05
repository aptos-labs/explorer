import {OCTA} from "../constants";
import {isNumeric} from "../pages/utils";
import {withResponseError} from "./client";
import {
  AccountAddressInput,
  AccountData,
  Aptos,
  APTOS_COIN,
  AptosConfig,
  Block,
  InputViewFunctionData,
  LedgerInfo,
  MoveModuleBytecode,
  MoveResource,
  MoveValue,
  TableItemRequest,
  TransactionResponse,
  TypeTagAddress,
  TypeTagU64,
} from "@aptos-labs/ts-sdk";

export async function getTransactions(
  requestParameters: {start?: number; limit?: number},
  client: Aptos,
): Promise<TransactionResponse[]> {
  const {start, limit} = requestParameters;
  const transactions = await withResponseError(
    client.getTransactions({options: {offset: start, limit}}),
  );

  // Sort in descending order
  // FIXME I think they're already sorted transactions.sort(sortTransactions);

  return transactions;
}

export async function getAccountTransactions(
  requestParameters: {address: string; start?: number; limit?: number},
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
  // FIXME I think they're already sorted transactions.sort(sortTransactions);

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
  requestParameters: {address: string},
  client: Aptos,
): Promise<AccountData> {
  const {address} = requestParameters;
  return withResponseError(client.getAccountInfo({accountAddress: address}));
}

export function getAccountResources(
  requestParameters: {address: string; ledgerVersion?: number},
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

export function getAccountResource<T extends MoveResource>(
  requestParameters: {
    address: string;
    resourceType: `${string}::${string}::${string}`;
    ledgerVersion?: number;
  },
  client: Aptos,
): Promise<T> {
  const {address, resourceType, ledgerVersion} = requestParameters;
  return withResponseError(
    client.getAccountResource<T>({
      accountAddress: address,
      resourceType,
      options: {
        ledgerVersion,
      },
    }),
  );
}

export function getAccountModules(
  requestParameters: {address: string; ledgerVersion?: number},
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
    address: string;
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
      options: {
        ledgerVersion,
      },
    }),
  );
}

export function view<T extends MoveValue[]>(
  request: InputViewFunctionData,
  client: Aptos,
  ledgerVersion?: string,
): Promise<T> {
  let parsedVersion = undefined;

  // Handle non-numbers, to default to the latest ledger version
  if (typeof ledgerVersion === "string") {
    const parsed = parseInt(ledgerVersion, 10);
    if (!isNaN(parsed)) {
      parsedVersion = undefined;
    } else {
      parsedVersion = parsed;
    }
  }

  return client.view<T>({
    payload: request,
    options: {ledgerVersion: parsedVersion},
  });
}

export function getTableItem<T>(
  requestParameters: {tableHandle: string; data: TableItemRequest},
  client: Aptos,
): Promise<T> {
  const {tableHandle, data} = requestParameters;
  return withResponseError(client.getTableItem<T>({handle: tableHandle, data}));
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
  const blockPromises = [];
  // Don't await here, or they'll be in serial
  for (let i = 0; i < count; i++) {
    const block = client.getBlockByHeight({
      blockHeight: currentBlockHeight - i,
      options: {withTransactions: false},
    });
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

  // TODO: Replace with native SDK call, it needs to be changed to return a bigint first
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
  client: Aptos,
  delegatorAddress: AccountAddressInput,
  validatorAddress: AccountAddressInput,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function: "0x1::delegation_pool::get_stake",
    typeArguments: [],
    functionArguments: [validatorAddress, delegatorAddress],
  };
  return withResponseError(client.view({payload}));
}

export async function getValidatorCommission(
  client: Aptos,
  validatorAddress: AccountAddressInput,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function: "0x1::delegation_pool::operator_commission_percentage",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return withResponseError(client.view({payload}));
}

export async function getValidatorCommissionChange(
  client: Aptos,
  validatorAddress: AccountAddressInput,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function:
      "0x1::delegation_pool::operator_commission_percentage_next_lockup_cycle",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return withResponseError(client.view({payload}));
}

export async function getDelegationPoolExist(
  client: Aptos,
  validatorAddress: AccountAddressInput,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function: "0x1::delegation_pool::delegation_pool_exists",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return withResponseError(client.view({payload}));
}

// Return whether `pending_inactive` stake can be directly withdrawn from the delegation pool,
// for the edge case when the validator had gone inactive before its lockup expired.
export async function getCanWithdrawPendingInactive(
  client: Aptos,
  validatorAddress: AccountAddressInput,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function: "0x1::delegation_pool::can_withdraw_pending_inactive",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return withResponseError(client.view({payload}));
}

export async function getAddStakeFee(
  client: Aptos,
  validatorAddress: AccountAddressInput,
  amount: string,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function: "0x1::delegation_pool::get_add_stake_fee",
    typeArguments: [],
    functionArguments: [validatorAddress, (Number(amount) * OCTA).toString()],
  };
  return withResponseError(client.view({payload}));
}

export async function getValidatorState(
  client: Aptos,
  validatorAddress: AccountAddressInput,
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function: "0x1::stake::get_validator_state",
    typeArguments: [],
    functionArguments: [validatorAddress],
  };
  return withResponseError(client.view({payload}));
}

export async function getValidatorCommisionAndState(
  client: Aptos,
  validatorAddresses: AccountAddressInput[],
): Promise<MoveValue[]> {
  const payload: InputViewFunctionData = {
    function:
      "0x7a5c34e80f796fe58c336812f80e15a86a2086c75640270a11207b911d512aba::helpers::pool_address_info",
    typeArguments: [],
    functionArguments: [validatorAddresses],
  };
  return withResponseError(client.view({payload}));
}
