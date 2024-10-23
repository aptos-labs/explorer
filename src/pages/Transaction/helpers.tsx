import React from "react";
import {
  LearnMoreTooltip,
  LearnMoreTooltipPlaceholder,
} from "../../components/IndividualPageContent/LearnMoreTooltip";

export function getLearnMoreTooltip(txnField: string): JSX.Element | null {
  switch (txnField) {
    case "accumulator_root_hash":
      return (
        <LearnMoreTooltip
          text="An accumulator root hash is the root hash of a Merkle accumulator."
          link="https://aptos.dev/en/network/glossary#merkle-accumulator"
        />
      );
    case "amount":
      return <LearnMoreTooltipPlaceholder />;
    case "authentication_key":
      return (
        <LearnMoreTooltip text="The authentication key is a hash of the public key for an account" />
      );
    case "block_height":
      return (
        <LearnMoreTooltip
          text="The block height is the number block in the blockchain."
          link="https://aptos.dev/en/network/glossary#blocks"
        />
      );
    case "epoch":
      return (
        <LearnMoreTooltip
          text="The period of time between validator set changes and other administrative actions."
          link="https://aptos.dev/en/network/glossary#epoch"
        />
      );
    case "event_root_hash":
      return (
        <LearnMoreTooltip
          text="Hash of the merkle tree root of the events emitted in the block."
          link="https://aptos.dev/en/network/glossary#event"
          linkToText
        />
      );
    case "expiration_timestamp_secs":
      return (
        <LearnMoreTooltip
          text="A transaction ceases to be valid after its expiration time."
          link="https://aptos.dev/en/network/glossary#expiration-time"
        />
      );
    case "fee_payer":
      return (
        <LearnMoreTooltip text="Account that paid for the gas fee of the transaction, separate of the sender." />
      );
    case "function":
      return (
        <LearnMoreTooltip text="Move function executed in the transaction." />
      );
    case "gas_fee":
      return (
        <LearnMoreTooltip
          text="The gas fee is the network's cost to run the transaction."
          link="https://aptos.dev/en/network/glossary#gas"
          linkToText
        />
      );
    case "gas_unit_price":
      return (
        <LearnMoreTooltip
          text="Gas unit price is the amount the user is willing to pay for the transaction per gas unit."
          link="https://aptos.dev/en/network/glossary#gas-unit-price"
          linkToText
        />
      );
    case "gas_used":
      return (
        <LearnMoreTooltip
          text="The total number of gas units used in the transaction."
          link="https://aptos.dev/en/network/glossary#gas"
        />
      );
    case "id":
      return <LearnMoreTooltipPlaceholder />;
    case "max_gas_amount":
      return (
        <LearnMoreTooltip
          text="The Maximum Gas Amount of a transaction is the maximum amount of gas units the sender is willing to pay for the transaction."
          link="https://aptos.dev/en/network/glossary#maximum-gas-amount"
        />
      );
    case "proposer":
      return <LearnMoreTooltipPlaceholder />;
    case "receiver":
      return <LearnMoreTooltipPlaceholder />;
    case "round":
      return (
        <LearnMoreTooltip
          text="A round consists of achieving consensus on a block of transactions and their execution results."
          link="https://aptos.dev/en/network/glossary#round"
        />
      );
    case "sender":
      return (
        <LearnMoreTooltip
          text="Sender is the address of the originator account for a transaction."
          link="https://aptos.dev/en/network/glossary#sender"
        />
      );
    case "sequence_number":
      return (
        <LearnMoreTooltip
          text="The sequence number for an account indicates the number of transactions that have been submitted and committed on chain from that account."
          link="https://aptos.dev/en/network/glossary#sequence-number"
        />
      );
    case "signature":
      return <LearnMoreTooltipPlaceholder />;
    case "state_change_hash":
      return <LearnMoreTooltipPlaceholder />;
    case "status":
      return <LearnMoreTooltipPlaceholder />;
    case "timestamp":
      return (
        <LearnMoreTooltip text="Timestamp is the machine timestamp of when leader creates and proposes a block for consensus." />
      );
    case "version":
      return (
        <LearnMoreTooltip
          text="A version is also called “height” in blockchain literature."
          link="https://aptos.dev/en/network/glossary/#version"
        />
      );
    case "vm_status":
      return (
        <LearnMoreTooltip
          text="Learn more about VM"
          link="https://aptos.dev/en/network/glossary#move-virtual-machine-mvm"
          linkToText
        />
      );
    default:
      return <LearnMoreTooltipPlaceholder />;
  }
}
