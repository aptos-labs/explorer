import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import TransactionsPreview from "./TransactionsPreview";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";

export default function LandingPage() {
  usePageMetadata({});
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  return (
    <Box>
      <Typography variant="h3" component="h3" marginBottom={4}>
        Movement Explorer
      </Typography>
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      {isGraphqlClientSupported ? <UserTransactionsPreview /> : <TransactionsPreview />}
    </Box>
  );
}
