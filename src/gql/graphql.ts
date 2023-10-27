import {TypedDocumentNode as DocumentNode} from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {[key: string]: unknown}> = {[K in keyof T]: T[K]};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends {[key: string]: unknown}, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | {[P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: {input: string; output: string};
  String: {input: string; output: string};
  Boolean: {input: boolean; output: boolean};
  Int: {input: number; output: number};
  Float: {input: number; output: number};
  Address: {input: any; output: any};
  /** The `Byte` scalar type represents byte value as a Buffer */
  Bytes: {input: any; output: any};
  DateTime: {input: any; output: any};
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: {input: any; output: any};
  U8: {input: any; output: any};
  U64: {input: any; output: any};
};

export type AddressFilter = {
  equals?: InputMaybe<Scalars["Address"]["input"]>;
};

export type Block_Metadata_Transaction = Transactions & {
  __typename?: "BLOCK_METADATA_TRANSACTION";
  accumulator_root_hash: Scalars["String"]["output"];
  entry_function_id_str?: Maybe<Scalars["String"]["output"]>;
  epoch: Scalars["U64"]["output"];
  event_root_hash: Scalars["String"]["output"];
  events: Array<Events>;
  failed_proposer_indices?: Maybe<Scalars["JSON"]["output"]>;
  gas_used: Scalars["U64"]["output"];
  hash: Scalars["String"]["output"];
  id?: Maybe<Scalars["String"]["output"]>;
  num_events: Scalars["U64"]["output"];
  num_write_set_changes: Scalars["U64"]["output"];
  previous_block_votes_bitvec?: Maybe<Scalars["JSON"]["output"]>;
  proposer?: Maybe<Scalars["String"]["output"]>;
  round?: Maybe<Scalars["U64"]["output"]>;
  state_change_hash: Scalars["String"]["output"];
  state_checkpoint_hash?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
  transaction_block_height: Scalars["U64"]["output"];
  transaction_type: Scalars["String"]["output"];
  transaction_version: Scalars["U64"]["output"];
  vm_status: Scalars["String"]["output"];
  write_set_changes_module: Array<WriteSetChangesModule>;
  write_set_changes_resource: Array<WriteSetChangesResource>;
  write_set_changes_table: Array<WriteSetChangesTable>;
};

export type DateTimeFilter = {
  equals?: InputMaybe<Scalars["DateTime"]["input"]>;
  gt?: InputMaybe<Scalars["DateTime"]["input"]>;
  gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  lt?: InputMaybe<Scalars["DateTime"]["input"]>;
  lte?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type Events = {
  __typename?: "Events";
  account_address: Scalars["Address"]["output"];
  creation_number: Scalars["U64"]["output"];
  data: Scalars["JSON"]["output"];
  event_index: Scalars["U64"]["output"];
  event_type: Scalars["String"]["output"];
  inserted_at: Scalars["DateTime"]["output"];
  sequence_number: Scalars["U64"]["output"];
  transaction_block_height: Scalars["U64"]["output"];
};

export type EventsFilterInput = {
  AND?: InputMaybe<Array<EventsFilterInput>>;
  NOT?: InputMaybe<EventsFilterInput>;
  OR?: InputMaybe<Array<EventsFilterInput>>;
  account_address?: InputMaybe<AddressFilter>;
  transaction_version?: InputMaybe<U64Filter>;
};

export type EventsOrderByInput = {
  account_address?: InputMaybe<OrderBy>;
  inserted_at?: InputMaybe<OrderBy>;
  transaction_version?: InputMaybe<OrderBy>;
};

export type Genesis_Transaction = Transactions & {
  __typename?: "GENESIS_TRANSACTION";
  accumulator_root_hash: Scalars["String"]["output"];
  epoch: Scalars["U64"]["output"];
  event_root_hash: Scalars["String"]["output"];
  events: Array<Events>;
  gas_used: Scalars["U64"]["output"];
  hash: Scalars["String"]["output"];
  num_events: Scalars["U64"]["output"];
  num_write_set_changes: Scalars["U64"]["output"];
  payload?: Maybe<Scalars["JSON"]["output"]>;
  state_change_hash: Scalars["String"]["output"];
  state_checkpoint_hash?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
  transaction_block_height: Scalars["U64"]["output"];
  transaction_type: Scalars["String"]["output"];
  transaction_version: Scalars["U64"]["output"];
  vm_status: Scalars["String"]["output"];
  write_set_changes_module: Array<WriteSetChangesModule>;
  write_set_changes_resource: Array<WriteSetChangesResource>;
  write_set_changes_table: Array<WriteSetChangesTable>;
};

export enum OrderBy {
  Asc = "Asc",
  Desc = "Desc",
}

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor?: Maybe<Scalars["String"]["output"]>;
};

export type Query = {
  __typename?: "Query";
  _service: _Service;
  events: QueryEventsConnection;
  transactions: QueryTransactionsConnection;
  write_set_changes_module: QueryWrite_Set_Changes_ModuleConnection;
  write_set_changes_resource: QueryWrite_Set_Changes_ResourceConnection;
  write_set_changes_table: QueryWrite_Set_Changes_TableConnection;
};

export type QueryEventsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<EventsOrderByInput>>;
  where?: InputMaybe<EventsFilterInput>;
};

export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<TransactionsOrderByInput>>;
  where?: InputMaybe<TransactionsFilterInput>;
};

export type QueryWrite_Set_Changes_ModuleArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<WriteSetChangesModuleOrderByInput>>;
  where?: InputMaybe<WriteSetChangesModuleFilterInput>;
};

export type QueryWrite_Set_Changes_ResourceArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<WriteSetChangesResourceOrderByInput>>;
  where?: InputMaybe<WriteSetChangesResourceFilterInput>;
};

export type QueryWrite_Set_Changes_TableArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<WriteSetChangesTableOrderByInput>>;
  where?: InputMaybe<WriteSetChangesTableFilterInput>;
};

export type QueryEventsConnection = {
  __typename?: "QueryEventsConnection";
  edges: Array<Maybe<QueryEventsConnectionEdge>>;
  pageInfo: PageInfo;
};

export type QueryEventsConnectionEdge = {
  __typename?: "QueryEventsConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: Events;
};

export type QueryTransactionsConnection = {
  __typename?: "QueryTransactionsConnection";
  edges: Array<Maybe<QueryTransactionsConnectionEdge>>;
  pageInfo: PageInfo;
};

export type QueryTransactionsConnectionEdge = {
  __typename?: "QueryTransactionsConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: Transactions;
};

export type QueryWrite_Set_Changes_ModuleConnection = {
  __typename?: "QueryWrite_set_changes_moduleConnection";
  edges: Array<Maybe<QueryWrite_Set_Changes_ModuleConnectionEdge>>;
  pageInfo: PageInfo;
};

export type QueryWrite_Set_Changes_ModuleConnectionEdge = {
  __typename?: "QueryWrite_set_changes_moduleConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: WriteSetChangesModule;
};

export type QueryWrite_Set_Changes_ResourceConnection = {
  __typename?: "QueryWrite_set_changes_resourceConnection";
  edges: Array<Maybe<QueryWrite_Set_Changes_ResourceConnectionEdge>>;
  pageInfo: PageInfo;
};

export type QueryWrite_Set_Changes_ResourceConnectionEdge = {
  __typename?: "QueryWrite_set_changes_resourceConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: WriteSetChangesResource;
};

export type QueryWrite_Set_Changes_TableConnection = {
  __typename?: "QueryWrite_set_changes_tableConnection";
  edges: Array<Maybe<QueryWrite_Set_Changes_TableConnectionEdge>>;
  pageInfo: PageInfo;
};

export type QueryWrite_Set_Changes_TableConnectionEdge = {
  __typename?: "QueryWrite_set_changes_tableConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: WriteSetChangesTable;
};

export type State_Checkpoint_Transaction = Transactions & {
  __typename?: "STATE_CHECKPOINT_TRANSACTION";
  accumulator_root_hash: Scalars["String"]["output"];
  epoch: Scalars["U64"]["output"];
  event_root_hash: Scalars["String"]["output"];
  events: Array<Events>;
  failed_proposer_indices?: Maybe<Scalars["JSON"]["output"]>;
  gas_used: Scalars["U64"]["output"];
  hash: Scalars["String"]["output"];
  num_events: Scalars["U64"]["output"];
  num_write_set_changes: Scalars["U64"]["output"];
  state_change_hash: Scalars["String"]["output"];
  state_checkpoint_hash?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
  transaction_block_height: Scalars["U64"]["output"];
  transaction_type: Scalars["String"]["output"];
  transaction_version: Scalars["U64"]["output"];
  vm_status: Scalars["String"]["output"];
  write_set_changes_module: Array<WriteSetChangesModule>;
  write_set_changes_resource: Array<WriteSetChangesResource>;
  write_set_changes_table: Array<WriteSetChangesTable>;
};

export type StringFilter = {
  contains?: InputMaybe<Scalars["String"]["input"]>;
  endsWith?: InputMaybe<Scalars["String"]["input"]>;
  equals?: InputMaybe<Scalars["String"]["input"]>;
  startsWith?: InputMaybe<Scalars["String"]["input"]>;
};

export type TransactionsFilterInput = {
  AND?: InputMaybe<Array<TransactionsFilterInput>>;
  NOT?: InputMaybe<TransactionsFilterInput>;
  OR?: InputMaybe<Array<TransactionsFilterInput>>;
  transaction_version?: InputMaybe<U64Filter>;
};

export type TransactionsOrderByInput = {
  transaction_version?: InputMaybe<OrderBy>;
};

export type U8Filter = {
  equals?: InputMaybe<Scalars["U8"]["input"]>;
  gt?: InputMaybe<Scalars["U8"]["input"]>;
  gte?: InputMaybe<Scalars["U8"]["input"]>;
  lt?: InputMaybe<Scalars["U8"]["input"]>;
  lte?: InputMaybe<Scalars["U8"]["input"]>;
};

export type U64Filter = {
  equals?: InputMaybe<Scalars["U64"]["input"]>;
  gt?: InputMaybe<Scalars["U64"]["input"]>;
  gte?: InputMaybe<Scalars["U64"]["input"]>;
  lt?: InputMaybe<Scalars["U64"]["input"]>;
  lte?: InputMaybe<Scalars["U64"]["input"]>;
};

export type User_Transaction = Transactions & {
  __typename?: "USER_TRANSACTION";
  accumulator_root_hash: Scalars["String"]["output"];
  epoch: Scalars["U64"]["output"];
  event_root_hash: Scalars["String"]["output"];
  events: Array<Events>;
  expiration_timestamp_secs?: Maybe<Scalars["DateTime"]["output"]>;
  gas_unit_price?: Maybe<Scalars["U64"]["output"]>;
  gas_used: Scalars["U64"]["output"];
  hash: Scalars["String"]["output"];
  max_gas_amount?: Maybe<Scalars["U64"]["output"]>;
  num_events: Scalars["U64"]["output"];
  num_write_set_changes: Scalars["U64"]["output"];
  parent_signature_type?: Maybe<Scalars["String"]["output"]>;
  payload?: Maybe<Scalars["JSON"]["output"]>;
  previous_block_votes_bitvec?: Maybe<Scalars["JSON"]["output"]>;
  sender?: Maybe<Scalars["String"]["output"]>;
  sequence_number?: Maybe<Scalars["U64"]["output"]>;
  signature?: Maybe<Scalars["JSON"]["output"]>;
  state_change_hash: Scalars["String"]["output"];
  state_checkpoint_hash?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
  transaction_block_height: Scalars["U64"]["output"];
  transaction_type: Scalars["String"]["output"];
  transaction_version: Scalars["U64"]["output"];
  vm_status: Scalars["String"]["output"];
  write_set_changes_module: Array<WriteSetChangesModule>;
  write_set_changes_resource: Array<WriteSetChangesResource>;
  write_set_changes_table: Array<WriteSetChangesTable>;
};

export type WriteSetChangesModule = {
  __typename?: "WriteSetChangesModule";
  address: Scalars["Address"]["output"];
  bytecode?: Maybe<Scalars["Bytes"]["output"]>;
  exposed_functions?: Maybe<Scalars["JSON"]["output"]>;
  friends?: Maybe<Scalars["JSON"]["output"]>;
  hash: Scalars["String"]["output"];
  index: Scalars["U64"]["output"];
  is_deleted: Scalars["Boolean"]["output"];
  structs?: Maybe<Scalars["JSON"]["output"]>;
  transaction_block_height: Scalars["U64"]["output"];
  write_set_change_type: Scalars["String"]["output"];
};

export type WriteSetChangesModuleFilterInput = {
  AND?: InputMaybe<Array<WriteSetChangesModuleFilterInput>>;
  NOT?: InputMaybe<WriteSetChangesModuleFilterInput>;
  OR?: InputMaybe<Array<WriteSetChangesModuleFilterInput>>;
  address?: InputMaybe<AddressFilter>;
  transaction_version?: InputMaybe<U64Filter>;
};

export type WriteSetChangesModuleOrderByInput = {
  address?: InputMaybe<OrderBy>;
  inserted_at?: InputMaybe<OrderBy>;
  transaction_version?: InputMaybe<OrderBy>;
};

export type WriteSetChangesResource = {
  __typename?: "WriteSetChangesResource";
  address: Scalars["Address"]["output"];
  data?: Maybe<Scalars["JSON"]["output"]>;
  generic_type_params?: Maybe<Scalars["JSON"]["output"]>;
  hash: Scalars["String"]["output"];
  index: Scalars["U64"]["output"];
  is_deleted: Scalars["Boolean"]["output"];
  module: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  state_key_hash: Scalars["String"]["output"];
  transaction_block_height: Scalars["U64"]["output"];
  write_set_change_type: Scalars["String"]["output"];
};

export type WriteSetChangesResourceFilterInput = {
  AND?: InputMaybe<Array<WriteSetChangesResourceFilterInput>>;
  NOT?: InputMaybe<WriteSetChangesResourceFilterInput>;
  OR?: InputMaybe<Array<WriteSetChangesResourceFilterInput>>;
  address?: InputMaybe<AddressFilter>;
  transaction_version?: InputMaybe<U64Filter>;
};

export type WriteSetChangesResourceOrderByInput = {
  address?: InputMaybe<OrderBy>;
  inserted_at?: InputMaybe<OrderBy>;
  transaction_version?: InputMaybe<OrderBy>;
};

export type WriteSetChangesTable = {
  __typename?: "WriteSetChangesTable";
  address: Scalars["Address"]["output"];
  data?: Maybe<Scalars["JSON"]["output"]>;
  decoded_key: Scalars["JSON"]["output"];
  decoded_value?: Maybe<Scalars["JSON"]["output"]>;
  hash: Scalars["String"]["output"];
  index: Scalars["U64"]["output"];
  is_deleted: Scalars["Boolean"]["output"];
  key: Scalars["String"]["output"];
  key_type?: Maybe<Scalars["String"]["output"]>;
  table_handle: Scalars["String"]["output"];
  transaction_block_height: Scalars["U64"]["output"];
  value_type?: Maybe<Scalars["String"]["output"]>;
  write_set_change_type: Scalars["String"]["output"];
};

export type WriteSetChangesTableFilterInput = {
  AND?: InputMaybe<Array<WriteSetChangesTableFilterInput>>;
  NOT?: InputMaybe<WriteSetChangesTableFilterInput>;
  OR?: InputMaybe<Array<WriteSetChangesTableFilterInput>>;
  address?: InputMaybe<AddressFilter>;
  transaction_version?: InputMaybe<U64Filter>;
};

export type WriteSetChangesTableOrderByInput = {
  address?: InputMaybe<OrderBy>;
  inserted_at?: InputMaybe<OrderBy>;
  transaction_version?: InputMaybe<OrderBy>;
};

export type _Service = {
  __typename?: "_Service";
  /** The sdl representing the federated service capabilities. Includes federation directives, removes federation types, and includes rest of full schema after schema directives have been applied */
  sdl?: Maybe<Scalars["String"]["output"]>;
};

export type Transactions = {
  accumulator_root_hash: Scalars["String"]["output"];
  epoch: Scalars["U64"]["output"];
  event_root_hash: Scalars["String"]["output"];
  events: Array<Events>;
  gas_used: Scalars["U64"]["output"];
  hash: Scalars["String"]["output"];
  num_events: Scalars["U64"]["output"];
  num_write_set_changes: Scalars["U64"]["output"];
  state_change_hash: Scalars["String"]["output"];
  state_checkpoint_hash?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
  transaction_block_height: Scalars["U64"]["output"];
  transaction_type: Scalars["String"]["output"];
  transaction_version: Scalars["U64"]["output"];
  vm_status: Scalars["String"]["output"];
  write_set_changes_module: Array<WriteSetChangesModule>;
  write_set_changes_resource: Array<WriteSetChangesResource>;
  write_set_changes_table: Array<WriteSetChangesTable>;
};

export type QueryQueryVariables = Exact<{
  where?: InputMaybe<TransactionsFilterInput>;
}>;

export type QueryQuery = {
  __typename?: "Query";
  transactions: {
    __typename?: "QueryTransactionsConnection";
    edges: Array<{
      __typename?: "QueryTransactionsConnectionEdge";
      node:
        | {
            __typename?: "BLOCK_METADATA_TRANSACTION";
            accumulator_root_hash: string;
            entry_function_id_str?: string | null;
            epoch: any;
            event_root_hash: string;
            failed_proposer_indices?: any | null;
            gas_used: any;
            hash: string;
            id?: string | null;
            num_events: any;
            num_write_set_changes: any;
            previous_block_votes_bitvec?: any | null;
            proposer?: string | null;
            round?: any | null;
            state_change_hash: string;
            state_checkpoint_hash?: string | null;
            success: boolean;
            timestamp?: any | null;
            transaction_block_height: any;
            transaction_type: string;
            transaction_version: any;
            vm_status: string;
            events: Array<{
              __typename?: "Events";
              account_address: any;
              creation_number: any;
              data: any;
              event_index: any;
              event_type: string;
              sequence_number: any;
              transaction_block_height: any;
            }>;
            write_set_changes_module: Array<{
              __typename?: "WriteSetChangesModule";
              address: any;
              bytecode?: any | null;
              exposed_functions?: any | null;
              friends?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              structs?: any | null;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_resource: Array<{
              __typename?: "WriteSetChangesResource";
              address: any;
              data?: any | null;
              generic_type_params?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              module: string;
              name: string;
              state_key_hash: string;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_table: Array<{
              __typename?: "WriteSetChangesTable";
              address: any;
              data?: any | null;
              decoded_key: any;
              decoded_value?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              key: string;
              key_type?: string | null;
              table_handle: string;
              transaction_block_height: any;
              value_type?: string | null;
              write_set_change_type: string;
            }>;
          }
        | {
            __typename?: "GENESIS_TRANSACTION";
            accumulator_root_hash: string;
            epoch: any;
            event_root_hash: string;
            gas_used: any;
            hash: string;
            num_events: any;
            num_write_set_changes: any;
            payload?: any | null;
            state_change_hash: string;
            state_checkpoint_hash?: string | null;
            success: boolean;
            timestamp?: any | null;
            transaction_block_height: any;
            transaction_type: string;
            transaction_version: any;
            vm_status: string;
            events: Array<{
              __typename?: "Events";
              account_address: any;
              creation_number: any;
              data: any;
              event_index: any;
              event_type: string;
              sequence_number: any;
              transaction_block_height: any;
            }>;
            write_set_changes_module: Array<{
              __typename?: "WriteSetChangesModule";
              address: any;
              bytecode?: any | null;
              exposed_functions?: any | null;
              friends?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              structs?: any | null;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_resource: Array<{
              __typename?: "WriteSetChangesResource";
              address: any;
              data?: any | null;
              generic_type_params?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              module: string;
              name: string;
              state_key_hash: string;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_table: Array<{
              __typename?: "WriteSetChangesTable";
              address: any;
              data?: any | null;
              decoded_key: any;
              decoded_value?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              key: string;
              key_type?: string | null;
              table_handle: string;
              transaction_block_height: any;
              value_type?: string | null;
              write_set_change_type: string;
            }>;
          }
        | {
            __typename?: "STATE_CHECKPOINT_TRANSACTION";
            accumulator_root_hash: string;
            epoch: any;
            event_root_hash: string;
            failed_proposer_indices?: any | null;
            gas_used: any;
            hash: string;
            num_events: any;
            num_write_set_changes: any;
            state_change_hash: string;
            state_checkpoint_hash?: string | null;
            success: boolean;
            timestamp?: any | null;
            transaction_block_height: any;
            transaction_type: string;
            transaction_version: any;
            vm_status: string;
            write_set_changes_module: Array<{
              __typename?: "WriteSetChangesModule";
              address: any;
              bytecode?: any | null;
              exposed_functions?: any | null;
              friends?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              structs?: any | null;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_resource: Array<{
              __typename?: "WriteSetChangesResource";
              address: any;
              data?: any | null;
              generic_type_params?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              module: string;
              name: string;
              state_key_hash: string;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_table: Array<{
              __typename?: "WriteSetChangesTable";
              address: any;
              data?: any | null;
              decoded_key: any;
              decoded_value?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              key: string;
              key_type?: string | null;
              table_handle: string;
              transaction_block_height: any;
              value_type?: string | null;
              write_set_change_type: string;
            }>;
          }
        | {
            __typename?: "USER_TRANSACTION";
            accumulator_root_hash: string;
            epoch: any;
            event_root_hash: string;
            expiration_timestamp_secs?: any | null;
            gas_unit_price?: any | null;
            gas_used: any;
            hash: string;
            max_gas_amount?: any | null;
            num_events: any;
            num_write_set_changes: any;
            parent_signature_type?: string | null;
            payload?: any | null;
            previous_block_votes_bitvec?: any | null;
            sender?: string | null;
            sequence_number?: any | null;
            signature?: any | null;
            state_change_hash: string;
            state_checkpoint_hash?: string | null;
            success: boolean;
            timestamp?: any | null;
            transaction_block_height: any;
            transaction_type: string;
            transaction_version: any;
            vm_status: string;
            events: Array<{
              __typename?: "Events";
              account_address: any;
              creation_number: any;
              data: any;
              event_index: any;
              event_type: string;
              sequence_number: any;
              transaction_block_height: any;
            }>;
            write_set_changes_module: Array<{
              __typename?: "WriteSetChangesModule";
              address: any;
              bytecode?: any | null;
              exposed_functions?: any | null;
              friends?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              structs?: any | null;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_resource: Array<{
              __typename?: "WriteSetChangesResource";
              address: any;
              data?: any | null;
              generic_type_params?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              module: string;
              name: string;
              state_key_hash: string;
              transaction_block_height: any;
              write_set_change_type: string;
            }>;
            write_set_changes_table: Array<{
              __typename?: "WriteSetChangesTable";
              address: any;
              data?: any | null;
              decoded_key: any;
              decoded_value?: any | null;
              hash: string;
              index: any;
              is_deleted: boolean;
              key: string;
              key_type?: string | null;
              table_handle: string;
              transaction_block_height: any;
              value_type?: string | null;
              write_set_change_type: string;
            }>;
          };
    } | null>;
  };
};

export const QueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: {kind: "Name", value: "Query"},
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {kind: "Variable", name: {kind: "Name", value: "where"}},
          type: {
            kind: "NamedType",
            name: {kind: "Name", value: "TransactionsFilterInput"},
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {kind: "Name", value: "transactions"},
            arguments: [
              {
                kind: "Argument",
                name: {kind: "Name", value: "where"},
                value: {kind: "Variable", name: {kind: "Name", value: "where"}},
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: {kind: "Name", value: "edges"},
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: {kind: "Name", value: "node"},
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: {
                                  kind: "Name",
                                  value: "BLOCK_METADATA_TRANSACTION",
                                },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "accumulator_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "entry_function_id_str",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "epoch"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "event_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "failed_proposer_indices",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "gas_used"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "hash"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "id"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "num_events"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "num_write_set_changes",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "previous_block_votes_bitvec",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "proposer"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "round"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_change_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_checkpoint_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "success"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "timestamp"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_block_height",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_type",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_version",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "vm_status"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "events"},
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "account_address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "creation_number",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "event_index",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "event_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "sequence_number",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_module",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "bytecode",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "exposed_functions",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "friends",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "structs",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_resource",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "generic_type_params",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "module"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "name"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "state_key_hash",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_table",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_key",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_value",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "key"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "key_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "table_handle",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: {
                                  kind: "Name",
                                  value: "GENESIS_TRANSACTION",
                                },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "accumulator_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "epoch"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "event_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "gas_used"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "hash"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "num_events"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "num_write_set_changes",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "payload"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_change_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_checkpoint_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "success"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "timestamp"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_block_height",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_type",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_version",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "vm_status"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "events"},
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "account_address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "creation_number",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "event_index",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "event_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "sequence_number",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_module",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "bytecode",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "exposed_functions",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "friends",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "structs",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_resource",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "generic_type_params",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "module"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "name"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "state_key_hash",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_table",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_key",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_value",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "key"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "key_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "table_handle",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: {
                                  kind: "Name",
                                  value: "STATE_CHECKPOINT_TRANSACTION",
                                },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "accumulator_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "epoch"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "event_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "failed_proposer_indices",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "gas_used"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "hash"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "num_events"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "num_write_set_changes",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_change_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_checkpoint_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "success"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "timestamp"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_block_height",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_type",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_version",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "vm_status"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_module",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "bytecode",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "exposed_functions",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "friends",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "structs",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_resource",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "generic_type_params",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "module"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "name"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "state_key_hash",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_table",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_key",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_value",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "key"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "key_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "table_handle",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: {kind: "Name", value: "USER_TRANSACTION"},
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "accumulator_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "epoch"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "event_root_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "expiration_timestamp_secs",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "gas_unit_price",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "gas_used"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "hash"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "max_gas_amount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "num_events"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "num_write_set_changes",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "parent_signature_type",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "payload"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "previous_block_votes_bitvec",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "sender"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "sequence_number",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "signature"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_change_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "state_checkpoint_hash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "success"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "timestamp"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_block_height",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_type",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "transaction_version",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "vm_status"},
                                  },
                                  {
                                    kind: "Field",
                                    name: {kind: "Name", value: "events"},
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "account_address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "creation_number",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "event_index",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "event_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "sequence_number",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_module",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "bytecode",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "exposed_functions",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "friends",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "structs",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_resource",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "generic_type_params",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "module"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "name"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "state_key_hash",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "write_set_changes_table",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "data"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_key",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "decoded_value",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "hash"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "index"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "is_deleted",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {kind: "Name", value: "key"},
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "key_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "table_handle",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "transaction_block_height",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value_type",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "write_set_change_type",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QueryQuery, QueryQueryVariables>;
