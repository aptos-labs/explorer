/**
 * Local type definitions replacing the legacy "aptos" package.
 *
 * These types mirror the Aptos REST API response shapes previously imported via
 * `import { Types } from "aptos"`. They are compile-time only (zero runtime cost).
 */

// biome-ignore-all lint/suspicious/noExplicitAny: legacy API types use `any` extensively

// ---------------------------------------------------------------------------
// Core primitives
// ---------------------------------------------------------------------------
export type Address = string;
export type MoveValue = any;
export type HexEncodedBytes = string;
export type U64 = string;
export type U128 = string;
export type U256 = string;
export type MoveType = string;
export type IdentifierWrapper = string;
export type MoveStructTag = string;
export type HashValue = string;

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------
export interface AccountData {
  sequence_number: string;
  authentication_key: string;
}

// ---------------------------------------------------------------------------
// Move types
// ---------------------------------------------------------------------------
export interface MoveResource {
  type: MoveStructTag;
  data: any;
}

export interface MoveModuleBytecode {
  bytecode: HexEncodedBytes;
  abi?: MoveModule;
}

export interface MoveModule {
  address: string;
  name: string;
  friends: string[];
  exposed_functions: MoveFunction[];
  structs: MoveStruct[];
}

export interface MoveFunction {
  name: string;
  visibility: string;
  is_entry: boolean;
  is_view: boolean;
  generic_type_params: MoveFunctionGenericTypeParam[];
  params: string[];
  return: string[];
}

export interface MoveFunctionGenericTypeParam {
  constraints: string[];
}

export interface MoveStruct {
  name: string;
  is_native: boolean;
  abilities: string[];
  generic_type_params: MoveStructGenericTypeParam[];
  fields: MoveStructField[];
}

export interface MoveStructGenericTypeParam {
  constraints: string[];
}

export interface MoveStructField {
  name: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export interface Event {
  guid: EventGuid;
  sequence_number: string;
  type: string;
  data: any;
}

export interface EventGuid {
  creation_number: string;
  account_address: string;
}

// ---------------------------------------------------------------------------
// Write set changes
// ---------------------------------------------------------------------------
export interface WriteSetChange_CreateResource {
  type: "create_resource";
  address: string;
  state_key_hash: string;
  data: MoveResource;
}

export type WriteSetChange =
  | WriteSetChange_DeleteModule
  | WriteSetChange_DeleteResource
  | WriteSetChange_DeleteTableItem
  | WriteSetChange_WriteModule
  | WriteSetChange_WriteResource
  | WriteSetChange_WriteTableItem
  | WriteSetChange_CreateResource;

export interface WriteSetChange_DeleteModule {
  type: "delete_module";
  address: string;
  state_key_hash: string;
  module: string;
}

export interface WriteSetChange_DeleteResource {
  type: "delete_resource";
  address: string;
  state_key_hash: string;
  resource: string;
}

export interface WriteSetChange_DeleteTableItem {
  type: "delete_table_item";
  state_key_hash: string;
  handle: string;
  key: string;
  data?: {
    key: string;
    key_type: string;
    value: string;
    value_type: string;
  };
}

export interface WriteSetChange_WriteModule {
  type: "write_module";
  address: string;
  state_key_hash: string;
  data: MoveModuleBytecode;
}

export interface WriteSetChange_WriteResource {
  type: "write_resource";
  address: string;
  state_key_hash: string;
  data: MoveResource;
}

export interface WriteSetChange_WriteTableItem {
  type: "write_table_item";
  state_key_hash: string;
  handle: string;
  key: string;
  value: string;
  data?: {
    key: string;
    key_type: string;
    value: string;
    value_type: string;
  };
}

// ---------------------------------------------------------------------------
// Transaction payloads
// ---------------------------------------------------------------------------
export interface TransactionPayload_EntryFunctionPayload {
  type: "entry_function_payload";
  function: string;
  type_arguments: string[];
  arguments: any[];
}

export interface TransactionPayload_ScriptPayload {
  type: "script_payload";
  code: {bytecode: HexEncodedBytes; abi?: MoveFunction};
  type_arguments: string[];
  arguments: any[];
}

export interface TransactionPayload_MultisigPayload {
  type: "multisig_payload";
  multisig_address: string;
  transaction_payload?: TransactionPayload_EntryFunctionPayload;
}

export type TransactionPayload =
  | TransactionPayload_EntryFunctionPayload
  | TransactionPayload_ScriptPayload
  | TransactionPayload_MultisigPayload;

// ---------------------------------------------------------------------------
// Signatures
// ---------------------------------------------------------------------------
export interface TransactionSignature {
  type: string;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
export interface Transaction_PendingTransaction {
  type: "pending_transaction";
  hash: string;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: TransactionPayload;
  signature?: TransactionSignature;
}

export interface Transaction_UserTransaction {
  type: "user_transaction";
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: WriteSetChange[];
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: TransactionPayload;
  signature?: TransactionSignature;
  events: Event[];
  timestamp: string;
}

export interface Transaction_GenesisTransaction {
  type: "genesis_transaction";
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: WriteSetChange[];
  payload: TransactionPayload;
  events: Event[];
}

export interface Transaction_BlockMetadataTransaction {
  type: "block_metadata_transaction";
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: WriteSetChange[];
  id: string;
  epoch: string;
  round: string;
  events: Event[];
  previous_block_votes_bitvec: number[];
  proposer: string;
  failed_proposer_indices: number[];
  timestamp: string;
}

export interface Transaction_StateCheckpointTransaction {
  type: "state_checkpoint_transaction";
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: WriteSetChange[];
  timestamp: string;
}

export interface Transaction_BlockEpilogueTransaction {
  type: "block_epilogue_transaction";
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: WriteSetChange[];
  timestamp?: string;
  block_end_info?: any;
}

export interface Transaction_ValidatorTransaction {
  type: "validator_transaction";
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: WriteSetChange[];
  events: Event[];
  timestamp: string;
}

export type Transaction =
  | Transaction_PendingTransaction
  | Transaction_UserTransaction
  | Transaction_GenesisTransaction
  | Transaction_BlockMetadataTransaction
  | Transaction_StateCheckpointTransaction
  | Transaction_BlockEpilogueTransaction
  | Transaction_ValidatorTransaction;

/** Alias used by some legacy code */
export type UserTransaction = Transaction_UserTransaction;

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------
export interface Block {
  block_height: string;
  block_hash: string;
  block_timestamp: string;
  first_version: string;
  last_version: string;
  transactions?: Transaction[];
}

// ---------------------------------------------------------------------------
// Ledger / Index
// ---------------------------------------------------------------------------
export interface IndexResponse {
  chain_id: number;
  epoch: string;
  ledger_version: string;
  oldest_ledger_version: string;
  ledger_timestamp: string;
  node_role: string;
  oldest_block_height: string;
  block_height: string;
  git_hash: string;
}

// ---------------------------------------------------------------------------
// View / Table requests
// ---------------------------------------------------------------------------
export interface ViewRequest {
  function: string;
  type_arguments: string[];
  arguments: any[];
}

export interface TableItemRequest {
  key_type: string;
  value_type: string;
  key: any;
}

// ---------------------------------------------------------------------------
// Token types (from IndexerClient)
// ---------------------------------------------------------------------------
export interface Current_Token_Datas_V2 {
  token_data_id: string;
  token_name: string;
  token_uri: string;
  token_standard: string;
  largest_property_version_v1?: number | null;
  token_properties: any;
  last_transaction_version?: number | null;
  last_transaction_timestamp?: string | null;
  description?: string;
  current_collection?: {
    collection_id: string;
    collection_name: string;
    creator_address: string;
    current_supply?: number;
    max_supply?: number;
    uri?: string;
    description?: string;
  };
}

// ---------------------------------------------------------------------------
// Legacy namespace wrapper
//
// Allows `import { Types } from "~/types/aptos"` and then `Types.Transaction`
// exactly like the old `import { Types } from "aptos"`.
// ---------------------------------------------------------------------------
export namespace Types {
  export type Address = import("~/types/aptos").Address;
  export type MoveValue = import("~/types/aptos").MoveValue;
  export type HexEncodedBytes = import("~/types/aptos").HexEncodedBytes;
  export type AccountData = import("~/types/aptos").AccountData;
  export type MoveResource = import("~/types/aptos").MoveResource;
  export type MoveModuleBytecode = import("~/types/aptos").MoveModuleBytecode;
  export type MoveModule = import("~/types/aptos").MoveModule;
  export type MoveFunction = import("~/types/aptos").MoveFunction;
  export type MoveFunctionGenericTypeParam =
    import("~/types/aptos").MoveFunctionGenericTypeParam;
  export type MoveStruct = import("~/types/aptos").MoveStruct;
  export type MoveStructField = import("~/types/aptos").MoveStructField;
  export type Event = import("~/types/aptos").Event;
  export type WriteSetChange = import("~/types/aptos").WriteSetChange;
  export type Transaction = import("~/types/aptos").Transaction;
  export type UserTransaction = import("~/types/aptos").UserTransaction;
  export type Transaction_UserTransaction =
    import("~/types/aptos").Transaction_UserTransaction;
  export type Transaction_PendingTransaction =
    import("~/types/aptos").Transaction_PendingTransaction;
  export type Transaction_GenesisTransaction =
    import("~/types/aptos").Transaction_GenesisTransaction;
  export type Transaction_BlockMetadataTransaction =
    import("~/types/aptos").Transaction_BlockMetadataTransaction;
  /** Short alias used in some files */
  export type BlockMetadataTransaction =
    import("~/types/aptos").Transaction_BlockMetadataTransaction;
  export type Transaction_StateCheckpointTransaction =
    import("~/types/aptos").Transaction_StateCheckpointTransaction;
  export type Transaction_BlockEpilogueTransaction =
    import("~/types/aptos").Transaction_BlockEpilogueTransaction;
  export type TransactionPayload = import("~/types/aptos").TransactionPayload;
  export type TransactionPayload_EntryFunctionPayload =
    import("~/types/aptos").TransactionPayload_EntryFunctionPayload;
  export type TransactionSignature =
    import("~/types/aptos").TransactionSignature;
  export type Block = import("~/types/aptos").Block;
  export type IndexResponse = import("~/types/aptos").IndexResponse;
  export type ViewRequest = import("~/types/aptos").ViewRequest;
  export type TableItemRequest = import("~/types/aptos").TableItemRequest;
}

// ---------------------------------------------------------------------------
// Error class (replaces FailedTransactionError from legacy package)
// ---------------------------------------------------------------------------
export class FailedTransactionError extends Error {
  constructor(
    message: string,
    public readonly transactionHash?: string,
  ) {
    super(message);
    this.name = "FailedTransactionError";
  }
}
