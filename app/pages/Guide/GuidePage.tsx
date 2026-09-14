import {
  Box,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {InlineMarkup, useTranslation} from "../../i18n";
import PageHeader from "../layout/PageHeader";
import {GUIDE_SECTIONS} from "./guideSections";

function GuideParagraphs({texts}: {texts: string[]}) {
  if (texts.length === 0) {
    return null;
  }
  return (
    <>
      {texts.map((text) => (
        <Typography
          key={text}
          variant="body1"
          component="p"
          sx={{
            mb: 2,
            maxWidth: "65ch",
            overflowWrap: "anywhere",
          }}
        >
          <InlineMarkup text={text} />
        </Typography>
      ))}
    </>
  );
}

function GuideBullets({items}: {items: string[]}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Box
      component="ul"
      sx={{pl: 3, mb: 2, maxWidth: "65ch", overflowWrap: "anywhere"}}
    >
      {items.map((item) => (
        <Box component="li" key={item} sx={{mb: 1}}>
          <Typography variant="body1" component="span">
            <InlineMarkup text={item} />
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function GuidePage() {
  const {t, tList} = useTranslation();

  return (
    <Box sx={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      <PageMetadata
        title={t("guide.meta.title")}
        description={t("guide.meta.description")}
        type="article"
        keywords={[
          "user guide",
          "help",
          "how to",
          "Aptos Explorer",
          "settings",
          "search",
        ]}
        canonicalPath="/guide"
      />
      <PageHeader />
      <Box
        sx={{
          py: 4,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 700,
          }}
        >
          {t("guide.meta.title")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 4,
            maxWidth: "65ch",
            overflowWrap: "anywhere",
          }}
        >
          <InlineMarkup text={t("guide.meta.intro")} />
        </Typography>

        <Stack
          direction={{xs: "column", md: "row"}}
          spacing={4}
          sx={{
            alignItems: "flex-start",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          <Paper
            component="nav"
            aria-label={t("guide.meta.tocLabel")}
            variant="outlined"
            sx={{
              p: 2,
              width: {xs: "100%", md: 260},
              maxWidth: "100%",
              boxSizing: "border-box",
              flexShrink: 0,
              position: {md: "sticky"},
              top: {md: 112},
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              {t("guide.meta.tocLabel")}
            </Typography>
            <Stack spacing={0.5}>
              {GUIDE_SECTIONS.map((section) => (
                <MuiLink
                  key={section.id}
                  href={`#${section.id}`}
                  underline="hover"
                  sx={{
                    fontSize: "0.9rem",
                    color: "text.primary",
                  }}
                >
                  {t(`${section.messageKey}.title`)}
                </MuiLink>
              ))}
            </Stack>
          </Paper>

          <Box
            component="article"
            sx={{
              minWidth: 0,
              flex: 1,
              maxWidth: "100%",
              overflowWrap: "anywhere",
            }}
          >
            {GUIDE_SECTIONS.map((section, index) => (
              <Box
                key={section.id}
                component="section"
                id={section.id}
                sx={{
                  scrollMarginTop: 112,
                  mb: 2,
                }}
              >
                {index > 0 ? <Divider sx={{mb: 4}} /> : null}
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  {t(`${section.messageKey}.title`)}
                </Typography>
                <GuideParagraphs
                  texts={tList(`${section.messageKey}.paragraphs`)}
                />
                <GuideBullets items={tList(`${section.messageKey}.bullets`)} />
                <GuideParagraphs texts={tList(`${section.messageKey}.more`)} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
