import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

export default function LandingPage() {
  usePageMetadata({});
  return (
    <Box>
      <Typography variant="h3" component="h3" marginBottom={4}>
        Movement Explorer
      </Typography>
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
