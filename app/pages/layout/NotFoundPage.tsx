import {ErrorOutlineOutlined as ErrorOutline} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {useTranslation} from "../../i18n";

export default function NotFoundPage() {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <ContentBox>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <ErrorOutline
          sx={{
            color: theme.palette.error.main,
            fontSize: 28,
            mt: 0.5,
          }}
        />
        <Stack spacing={1} sx={{flex: 1}}>
          <Typography variant="h6" color="error">
            {t("errors.pageNotFound404")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            {t("errors.pageNotFoundHint")}
            <br />
            <br />
            {t("errors.pageNotFoundStay")}
          </Typography>
        </Stack>
      </Stack>
    </ContentBox>
  );
}
