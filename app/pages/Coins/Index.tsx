import {Box, Typography} from "@mui/material";
import {useGetCoinList} from "../../api/hooks/useGetCoinList";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import LoadingModal from "../../components/LoadingModal";
import {useTranslation} from "../../i18n";
import PageHeader from "../layout/PageHeader";
import CoinsListTable from "./Table";

export default function CoinsPage() {
  const {t} = useTranslation();
  const {data, isLoading, error} = useGetCoinList();

  return (
    <>
      <PageMetadata
        title={t("pages.coins.title")}
        description={t("pages.coins.listDescription")}
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
        <Typography
          variant="h3"
          component="h1"
          sx={{
            marginBottom: 2,
          }}
        >
          {t("pages.coins.title")}
        </Typography>
        {error ? (
          <Typography color="error">{t("pages.coins.loadError")}</Typography>
        ) : (
          <CoinsListTable coins={data?.data ?? []} isLoading={isLoading} />
        )}
      </Box>
    </>
  );
}
