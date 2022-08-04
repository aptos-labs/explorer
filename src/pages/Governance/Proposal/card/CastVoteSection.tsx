import React from "react";
import Section from "./Section";
import {useWalletContext} from "../../../../context/wallet/context";
import ConnectWalletInfo from "./ConnectWalletInfo";
import VoteButtons from "./VoteButtons";

type CastVoteSectionProps = {
  proposalId: string;
};

export default function CastVoteSection({proposalId}: CastVoteSectionProps) {
  const {isConnected} = useWalletContext();

  return (
    <Section title="Cast your vote">
      {isConnected ? (
        <VoteButtons proposalId={proposalId} />
      ) : (
        <ConnectWalletInfo />
      )}
    </Section>
  );
}
