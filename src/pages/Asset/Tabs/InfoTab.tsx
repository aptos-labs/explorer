import {Types} from "aptos";
import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Image} from "@mui/icons-material";
import HashButton, {HashType} from "../../../components/HashButton";
import {Hex} from "@aptos-labs/ts-sdk";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";

type InfoTabProps = {
  address: string;
  accountData: Types.MoveResource[] | undefined;
};

interface Metadata {
  decimals: number;
  icon_uri: string;
  name: string;
  project_uri: string;
  symbol: string;
}

export default function InfoTab({accountData}: InfoTabProps) {
  if (!accountData) {
    return <EmptyTabContent />;
  }

  const metadataResource = accountData.find(
    (resource) => resource.type === "0x1::fungible_asset::Metadata",
  );
  const metadata = metadataResource
    ? (metadataResource.data as Metadata)
    : undefined;

  const primaryFungibleStoreDerivePod = accountData.find(
    (resource) => resource.type === "0x1::primary_fungible_store::DeriveRefPod",
  );
  // TODO: add typing
  const objectCore = accountData.find(
    (resource) => resource.type === "0x1::object::ObjectCore",
  ) as any | undefined;

  const pairedCoinType = accountData.find(
    (resource) => resource.type === "0x1::coin::PairedCoinType",
  ) as any | undefined;

  const concurrentSupply = accountData.find(
    (resource) => resource.type === "0x1::fungible_asset::ConcurrentSupply",
  ) as any | undefined;

  function parsePairedCoinType(pairedCoinType: any) {
    if (!pairedCoinType) {
      return "";
    }
    const moduleName = new TextDecoder().decode(
      Hex.fromHexString(pairedCoinType.data.type.module_name).toUint8Array(),
    );
    const structName = new TextDecoder().decode(
      Hex.fromHexString(pairedCoinType.data.type.struct_name).toUint8Array(),
    );

    return `${pairedCoinType.data.type.account_address}::${moduleName}::${structName}`;
  }

  function getSupply(): string {
    return (
      getFormattedBalanceStr(
        concurrentSupply?.data?.current?.value,
        metadata?.decimals,
      ) +
      " " +
      metadata?.symbol
    );
  }

  // TODO: Add placeholder image or use Panora to override
  return (
    <Box marginBottom={3}>
      <ContentBox>
        {pairedCoinType && (
          <ContentRow
            title={"Paired Coin:"}
            value={parsePairedCoinType(pairedCoinType)}
          ></ContentRow>
        )}
        <ContentRow title={"Symbol:"} value={metadata?.symbol ?? "N/A"} />
        <ContentRow title={"Decimals:"} value={metadata?.decimals ?? "N/A"} />
        <ContentRow
          title={"Icon:"}
          value={<Image href={metadata?.icon_uri ?? ""} />}
        />
        <ContentRow
          title={"Project URL:"}
          value={<Image href={metadata?.project_uri ?? ""} />}
        />
        <ContentRow
          title={"Owner"}
          value={
            <HashButton
              hash={objectCore?.data?.owner}
              type={HashType.ACCOUNT}
            />
          }
        />
        <ContentRow title={"Supply"} value={getSupply()} />
        <ContentRow
          title={"Allows Primary Fungible Store"}
          value={primaryFungibleStoreDerivePod ? "Yes" : "No"}
        />
      </ContentBox>
    </Box>
  );
}
