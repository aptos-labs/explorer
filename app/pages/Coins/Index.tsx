import * as React from "react";
import {Box, Typography} from "@mui/material";
import PageHeader from "../layout/PageHeader";
import LoadingModal from "../../components/LoadingModal";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {useGetCoinList} from "../../api/hooks/useGetCoinList";
import CoinsListTable from "./Table";

export default function CoinsPage() {
  const {data, isLoading, error} = useGetCoinList();

  return (
    <>
      <PageMetadata
        title="Coins & Fungible Assets"
        description="Browse the top coins and fungible assets on the Aptos blockchain. View token details, supply, price, market cap, and verification status."
        type="website"
        keywords={[
          "coins",
          "fungible assets",
          "tokens",
          "crypto",
          "price",
          "market cap",
          "supply",
        ]}
        canonicalPath="/coins"
      />
      <LoadingModal open={isLoading} />
      <Box>
        <PageHeader />
        <Typography variant="h3" marginBottom={2}>
          Coins & Fungible Assets
        </Typography>
        {error ? (
          <Typography color="error">
            Error loading coin list. Please try again later.
          </Typography>
        ) : (
          <CoinsListTable coins={data?.data ?? []} isLoading={isLoading} />
        )}
      </Box>
    </>
  );
}
