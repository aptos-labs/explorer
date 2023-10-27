import {Stack, Grid, Alert} from "@mui/material";
import {useParams} from "react-router-dom";
import TransactionTitle from "./Title";
import TransactionTabs from "./Tabs";
import PageHeader from "../layout/PageHeader";
import {useQuery} from "@apollo/client";
import gql from "graphql-tag";
import Error from "./Error";

export default function TransactionIndexerPage() {
  const {txnHashOrVersion: txnParam} = useParams();
  const txnHashOrVersion = txnParam ?? "";

  const GET_TRANSACTION_BY_VERSION = gql(`
    query Query($where: TransactionsFilterInput) {
      transactions(where: $where) {
        edges {
          node {
            ... on BLOCK_METADATA_TRANSACTION {
              accumulator_root_hash
              entry_function_id_str
              epoch
              event_root_hash
              failed_proposer_indices
              gas_used
              hash
              id
              num_events
              num_write_set_changes
              previous_block_votes_bitvec
              proposer
              round
              state_change_hash
              state_checkpoint_hash
              success
              timestamp
              transaction_block_height
              transaction_type
              transaction_version
              vm_status
              events {
                account_address
                creation_number
                data
                event_index
                event_type
                sequence_number
                transaction_block_height
              }
              write_set_changes_module {
                address
                bytecode
                exposed_functions
                friends
                hash
                index
                is_deleted
                structs
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_resource {
                address
                data
                generic_type_params
                hash
                index
                is_deleted
                module
                name
                state_key_hash
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_table {
                address
                data
                decoded_key
                decoded_value
                hash
                index
                is_deleted
                key
                key_type
                table_handle
                transaction_block_height
                value_type
                write_set_change_type
              }
            }
            ... on GENESIS_TRANSACTION {
              accumulator_root_hash
              epoch
              event_root_hash
              gas_used
              hash
              num_events
              num_write_set_changes
              payload
              state_change_hash
              state_checkpoint_hash
              success
              timestamp
              transaction_block_height
              transaction_type
              transaction_version
              vm_status
              events {
                account_address
                creation_number
                data
                event_index
                event_type
                sequence_number
                transaction_block_height
              }
              write_set_changes_module {
                address
                bytecode
                exposed_functions
                friends
                hash
                index
                is_deleted
                structs
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_resource {
                address
                data
                generic_type_params
                hash
                index
                is_deleted
                module
                name
                state_key_hash
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_table {
                address
                data
                decoded_key
                decoded_value
                hash
                index
                is_deleted
                key
                key_type
                table_handle
                transaction_block_height
                value_type
                write_set_change_type
              }
            }
            ... on STATE_CHECKPOINT_TRANSACTION {
              accumulator_root_hash
              epoch
              event_root_hash
              failed_proposer_indices
              gas_used
              hash
              num_events
              num_write_set_changes
              state_change_hash
              state_checkpoint_hash
              success
              timestamp
              transaction_block_height
              transaction_type
              transaction_version
              vm_status
              write_set_changes_module {
                address
                bytecode
                exposed_functions
                friends
                hash
                index
                is_deleted
                structs
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_resource {
                address
                data
                generic_type_params
                hash
                index
                is_deleted
                module
                name
                state_key_hash
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_table {
                address
                data
                decoded_key
                decoded_value
                hash
                index
                is_deleted
                key
                key_type
                table_handle
                transaction_block_height
                value_type
                write_set_change_type
              }
            }
            ... on USER_TRANSACTION {
              accumulator_root_hash
              epoch
              event_root_hash
              expiration_timestamp_secs
              gas_unit_price
              gas_used
              hash
              max_gas_amount
              num_events
              num_write_set_changes
              parent_signature_type
              payload
              previous_block_votes_bitvec
              sender
              sequence_number
              signature
              state_change_hash
              state_checkpoint_hash
              success
              timestamp
              transaction_block_height
              transaction_type
              transaction_version
              vm_status
              events {
                account_address
                creation_number
                data
                event_index
                event_type
                sequence_number
                transaction_block_height
              }
              write_set_changes_module {
                address
                bytecode
                exposed_functions
                friends
                hash
                index
                is_deleted
                structs
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_resource {
                address
                data
                generic_type_params
                hash
                index
                is_deleted
                module
                name
                state_key_hash
                transaction_block_height
                write_set_change_type
              }
              write_set_changes_table {
                address
                data
                decoded_key
                decoded_value
                hash
                index
                is_deleted
                key
                key_type
                table_handle
                transaction_block_height
                value_type
                write_set_change_type
              }
            }
          }
        }
      }
    }
  `);

  const {loading, data, error} = useQuery(GET_TRANSACTION_BY_VERSION, {
    variables: {
      where: {transaction_version: {equals: txnHashOrVersion}},
    },
  });

  if (loading) {
    return null;
  }

  if (error) {
    return <Error error={error} txnHashOrVersion={txnHashOrVersion} />;
  }

  if (!data) {
    return (
      <Alert severity="error">
        Got an empty response fetching transaction with version or hash{" "}
        {txnHashOrVersion}
        <br />
        Try again later
      </Alert>
    );
  }

  return (
    <Grid container>
      <PageHeader />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TransactionTitle transaction={data.transactions.edges[0].node} />
          <TransactionTabs transaction={data.transactions.edges[0].node} />
        </Stack>
      </Grid>
    </Grid>
  );
}
