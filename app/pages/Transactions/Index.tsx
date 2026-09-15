import {Box, Button, Stack, Typography} from "@mui/material";
import {useEffect} from "react";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {useTranslation} from "../../i18n";
import {useSearchParams} from "../../routing";
import PageHeader from "../layout/PageHeader";
import AllTransactions from "./AllTransactions";
import UserTransactions from "./UserTransactions";

export default function TransactionsPage() {
  const {t} = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const allTxnOnly = searchParams.get("type") === "all";

  // Initial search params setup with replace for support back navigation
  useEffect(() => {
    if (!searchParams.get("type")) {
      searchParams.set("type", isGraphqlClientSupported ? "user" : "all");
      setSearchParams(searchParams, {replace: true});
    }
  }, [isGraphqlClientSupported, searchParams, setSearchParams]);

  const toggleUserTxnOnly = () => {
    if (allTxnOnly) {
      searchParams.set("type", "user");
      searchParams.delete("start");
      setSearchParams(searchParams);
    } else {
      searchParams.set("type", "all");
      searchParams.delete("page");
      setSearchParams(searchParams);
    }
  };

  return (
    <Box>
      <PageMetadata
        title={t("pages.transactions.title")}
        description={t("pages.transactions.metaDescription")}
        type="website"
        keywords={[
          "transactions",
          "tx",
          "transfer",
          "gas fees",
          "blockchain activity",
          "real-time",
        ]}
        canonicalPath="/transactions"
      />
      <PageHeader />
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            marginBottom: 2,
          }}
        >
          {allTxnOnly
            ? t("pages.transactions.all")
            : t("pages.transactions.user")}
        </Typography>
        {isGraphqlClientSupported && (
          <Button onClick={toggleUserTxnOnly} variant="text">
            {allTxnOnly
              ? t("pages.transactions.viewUser")
              : t("pages.transactions.viewAll")}
          </Button>
        )}
      </Stack>
      {allTxnOnly ? <AllTransactions /> : <UserTransactions />}
    </Box>
  );
}
