import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {WalletDeprecationBanner} from "../../components/WalletDeprecationBanner";

export default function LandingPage() {
  usePageMetadata({});
  return (
    <Box>
      <WalletDeprecationBanner />
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
