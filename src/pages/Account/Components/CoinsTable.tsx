import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {grey} from "../../../themes/colors/aptosColorPalette";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {VerifiedCoinCell} from "../../../components/Table/VerifiedCell";
import {LearnMoreTooltip} from "../../../components/IndividualPageContent/LearnMoreTooltip";
import {getAssetSymbol} from "../../../utils";

function CoinNameCell({name}: {name: string}) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: 300,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </GeneralTableCell>
  );
}

function AmountCell({
  amount,
  decimals,
  symbol,
}: {
  amount: number | null | undefined;
  decimals: number | null | undefined;
  symbol: string;
}) {
  if (amount == null || decimals == null) {
    return <GeneralTableCell>-</GeneralTableCell>;
  }

  const formattedAmount = amount / Math.pow(10, decimals);
  return (
    <GeneralTableCell>
      <span>{formattedAmount}</span>
      <span style={{marginLeft: 8, color: grey[450]}}>{symbol}</span>
    </GeneralTableCell>
  );
}

function CoinTypeCell({data}: {data: CoinDescriptionPlusAmount}) {
  function getType() {
    switch (data.tokenStandard) {
      case "v1":
        return HashType.COIN;
      case "v2":
        return HashType.FUNGIBLE_ASSET;
      default:
        return HashType.OTHERS;
    }
  }

  return (
    <GeneralTableCell sx={{width: 450}}>
      <HashButton
        hash={data.tokenAddress ?? data.faAddress ?? "Unknown"}
        type={getType()}
        size="large"
        img={data.logoUrl}
      />
    </GeneralTableCell>
  );
}

function CoinVerifiedCell({data}: {data: CoinDescriptionPlusAmount}) {
  return VerifiedCoinCell({
    data: {
      id: data.tokenAddress ?? data.faAddress ?? "Unknown",
      known: data.chainId !== 0,
      isBanned: data.isBanned,
      isInPanoraTokenList: data.isInPanoraTokenList,
    },
  });
}

export type CoinDescriptionPlusAmount = {
  amount: number;
  tokenStandard: string;
} & CoinDescription;

export function CoinsTable({coins}: {coins: CoinDescriptionPlusAmount[]}) {
  // TODO: For FA, possibly add store as more info
  return (
    <Table>
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="Name" />
          <GeneralTableHeaderCell header="Asset Type" />
          <GeneralTableHeaderCell header="Asset" />
          <GeneralTableHeaderCell
            header="Verified"
            tooltip={
              <LearnMoreTooltip
                text="This uses the Panora token list to verify authenticity of known assets on-chain.  It does not guarantee anything else about the asset and is not financial advice."
                link="https://github.com/PanoraExchange/Aptos-Tokens"
              />
            }
            isTableTooltip={true}
          />
          <GeneralTableHeaderCell header="Amount" />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {coins.map((coinDesc, i) => {
          let friendlyType = coinDesc.tokenStandard;
          switch (friendlyType) {
            case "v1":
              friendlyType = "Coin";
              break;
            case "v2":
              friendlyType = "Fungible Asset";
              break;
          }
          return (
            <GeneralTableRow key={i}>
              <CoinNameCell name={coinDesc.name} />
              <CoinNameCell name={friendlyType} />
              <CoinTypeCell data={coinDesc} />
              <CoinVerifiedCell data={coinDesc} />
              <AmountCell
                amount={coinDesc.amount}
                decimals={coinDesc.decimals}
                symbol={getAssetSymbol(
                  coinDesc.panoraSymbol,
                  coinDesc.bridge,
                  coinDesc.symbol,
                )}
              />
            </GeneralTableRow>
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
