import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {InlineMarkup, useTranslation} from "../../i18n";

function MarkupParagraph({text, sx}: {text: string; sx?: object}) {
  return (
    <Typography variant="body1" sx={sx}>
      <InlineMarkup text={text} />
    </Typography>
  );
}

function MarkupList({items}: {items: string[]}) {
  return (
    <Box component="ul" sx={{pl: 3, mb: 2}}>
      {items.map((item) => (
        <Box component="li" key={item} sx={{mb: 0.5}}>
          <Typography variant="body1" component="span">
            <InlineMarkup text={item} />
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function VerificationPage() {
  const {t, tList} = useTranslation();

  return (
    <>
      <PageMetadata
        title={t("verificationPage.metaTitle")}
        description={t("verificationPage.metaDescription")}
        type="article"
        keywords={[
          "verification",
          "token verification",
          "address verification",
          "Panora",
          "scam protection",
          "trusted",
        ]}
        canonicalPath="/verification"
      />
      <Box
        sx={{
          maxWidth: "lg",
          mx: "auto",
          px: 3,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 4,
          }}
        >
          {t("verificationPage.heading")}
        </Typography>

        <Alert severity="info" sx={{mb: 4}}>
          <AlertTitle>{t("verificationPage.overviewTitle")}</AlertTitle>
          {t("verificationPage.overviewBody")}
        </Alert>

        <Paper sx={{p: 4, mb: 4}}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
            }}
          >
            {t("verificationPage.tokenTitle")}
          </Typography>

          <Alert severity="warning" sx={{mb: 3}}>
            <AlertTitle>{t("verificationPage.importantTitle")}</AlertTitle>
            <InlineMarkup text={t("verificationPage.importantBody")} />
          </Alert>

          <MarkupParagraph
            text={t("verificationPage.tokenIntro")}
            sx={{mb: 2}}
          />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.communityTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.communityBody")}
            sx={{mb: 2}}
          />
          <Box sx={{pl: 2, mb: 2}}>
            <InlineMarkup text="[https://github.com/PanoraExchange/Aptos-Tokens](https://github.com/PanoraExchange/Aptos-Tokens)" />
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.labsTitle")}
          </Typography>
          <MarkupParagraph text={t("verificationPage.labsBody")} sx={{mb: 2}} />
          <MarkupList items={tList("verificationPage.labsBullets")} />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.levelsTitle")}
          </Typography>
          <MarkupList items={tList("verificationPage.levelsBullets")} />
        </Paper>

        <Paper sx={{p: 4, mb: 4}}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
            }}
          >
            {t("verificationPage.addressTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.addressIntro")}
            sx={{mb: 2}}
          />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.submitTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.submitBody")}
            sx={{mb: 2}}
          />
          <Box sx={{pl: 2, mb: 2}}>
            <InlineMarkup
              text={`[${t("verificationPage.submitLink")}](https://github.com/aptos-labs/explorer/issues/new?assignees=&labels=&projects=&template=verification_request.md&title=%5Bverification%5D+%3CTitle%3E)`}
            />
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.requiredTitle")}
          </Typography>
          <MarkupList items={tList("verificationPage.requiredBullets")} />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.eligibleTitle")}
          </Typography>
          <MarkupList items={tList("verificationPage.eligibleBullets")} />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 2,
            }}
          >
            {t("verificationPage.docsTitle")}
          </Typography>
          <MarkupParagraph text={t("verificationPage.docsBody")} sx={{mb: 2}} />
          <MarkupList items={tList("verificationPage.docsBullets")} />
        </Paper>

        <Paper sx={{p: 4}}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
            }}
          >
            {t("verificationPage.securityTitle")}
          </Typography>

          <Alert severity="error" sx={{mb: 3}}>
            <AlertTitle>
              {t("verificationPage.securityWarningTitle")}
            </AlertTitle>
            {t("verificationPage.securityWarningBody")}
          </Alert>

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 2,
              mb: 2,
            }}
          >
            {t("verificationPage.networkTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.networkBody")}
            sx={{mb: 2}}
          />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 2,
              mb: 2,
            }}
          >
            {t("verificationPage.bannedTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.bannedBody")}
            sx={{mb: 2}}
          />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 2,
              mb: 2,
            }}
          >
            {t("verificationPage.processingTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.processingBody")}
            sx={{mb: 2}}
          />

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 2,
              mb: 2,
            }}
          >
            {t("verificationPage.supportTitle")}
          </Typography>
          <MarkupParagraph
            text={t("verificationPage.supportBody")}
            sx={{mb: 2}}
          />
          <Box component="ul" sx={{pl: 3}}>
            <Box component="li" sx={{mb: 0.5}}>
              <Typography variant="body1" component="span">
                <InlineMarkup text={t("verificationPage.supportAddress")} />
              </Typography>
            </Box>
            <Box component="li" sx={{mb: 0.5}}>
              <Typography variant="body1" component="span">
                <InlineMarkup text={t("verificationPage.supportToken")} />
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1" component="span">
                <InlineMarkup text={t("verificationPage.supportGeneral")} />
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
