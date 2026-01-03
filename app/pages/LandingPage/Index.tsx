import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

export default function LandingPage() {
  return (
    <Box>
      <PageMetadata
        title="Aptos Explorer - Blockchain Explorer"
        description="Explore transactions, accounts, blocks, validators, NFTs, and network activity on the Aptos blockchain. Real-time data, analytics, and the official block explorer for the Aptos Network."
        type="website"
        keywords={[
          "Aptos",
          "blockchain explorer",
          "transactions",
          "accounts",
          "blocks",
          "validators",
          "NFTs",
          "web3",
        ]}
        canonicalPath="/"
      />
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
