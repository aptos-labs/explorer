import {
  alpha,
  Box,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  type SxProps,
  type Theme,
  Typography,
  useTheme,
} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {InlineMarkup, useTranslation} from "../../i18n";
import PageHeader from "../layout/PageHeader";
import {GUIDE_SECTIONS} from "./guideSections";
import {useGuideActiveSection} from "./useGuideActiveSection";

const guideBodyTypography = {
  fontSize: "1.0625rem",
  lineHeight: 1.7,
} as const;

const guideArticleMaxWidth = "42rem";
const guideTocWidthPx = 280;

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
            ...guideBodyTypography,
            mb: 2.5,
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
      sx={{
        pl: 2.75,
        mb: 2.5,
        overflowWrap: "anywhere",
        "& li": {
          mb: 1.25,
          lineHeight: 1.7,
          "&::marker": {
            color: "text.secondary",
          },
        },
      }}
    >
      {items.map((item) => (
        <Box component="li" key={item}>
          <Typography variant="body1" component="span" sx={guideBodyTypography}>
            <InlineMarkup text={item} />
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

const guideSectionIds = GUIDE_SECTIONS.map((section) => section.id);

function GuideTocNav({
  activeSectionId,
  paperSx,
  t,
}: {
  activeSectionId: string | undefined;
  paperSx?: SxProps<Theme>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const theme = useTheme();

  return (
    <Paper
      component="nav"
      aria-label={t("guide.meta.tocLabel")}
      variant="outlined"
      sx={[
        {
          p: 2.5,
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 2,
          bgcolor: alpha(
            theme.palette.text.primary,
            theme.palette.mode === "dark" ? 0.06 : 0.03,
          ),
          borderColor: alpha(theme.palette.divider, 0.9),
          boxShadow: "none",
        },
        ...(Array.isArray(paperSx) ? paperSx : paperSx ? [paperSx] : []),
      ]}
    >
      <Typography
        variant="overline"
        component="p"
        sx={{
          display: "block",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "text.secondary",
          mb: 1.5,
          lineHeight: 1.4,
        }}
      >
        {t("guide.meta.tocLabel")}
      </Typography>
      <Stack spacing={0.25}>
        {GUIDE_SECTIONS.map((section) => {
          const isActive = activeSectionId === section.id;
          return (
            <MuiLink
              key={section.id}
              href={`#${section.id}`}
              underline="none"
              aria-current={isActive ? "location" : undefined}
              sx={{
                display: "block",
                py: 0.75,
                px: 1.25,
                borderRadius: 1,
                fontSize: "0.875rem",
                lineHeight: 1.45,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "primary.main" : "text.secondary",
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, 0.12)
                  : "transparent",
                transition: theme.transitions.create([
                  "background-color",
                  "color",
                ]),
                "&:hover": {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.16)
                    : "action.hover",
                  color: isActive ? "primary.main" : "text.primary",
                },
              }}
            >
              {t(`${section.messageKey}.title`)}
            </MuiLink>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function GuidePage() {
  const theme = useTheme();
  const {t, tList} = useTranslation();
  const activeSectionId = useGuideActiveSection(guideSectionIds);

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
            textAlign: "center",
          }}
        >
          {t("guide.meta.title")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            ...guideBodyTypography,
            color: "text.secondary",
            fontSize: "1.125rem",
            lineHeight: 1.65,
            mb: 6,
            maxWidth: guideArticleMaxWidth,
            mx: "auto",
            textAlign: "center",
            overflowWrap: "anywhere",
          }}
        >
          <InlineMarkup text={t("guide.meta.intro")} />
        </Typography>

        <Box
          sx={{
            display: {xs: "flex", lg: "grid"},
            flexDirection: {xs: "column"},
            gridTemplateColumns: {
              lg: `1fr minmax(0, ${guideArticleMaxWidth}) 1fr`,
            },
            columnGap: {lg: 3},
            rowGap: {xs: 3},
            alignItems: "start",
            width: "100%",
            minWidth: 0,
          }}
        >
          <GuideTocNav
            activeSectionId={activeSectionId}
            t={t}
            paperSx={{
              order: {xs: -1, lg: 0},
              gridColumn: {lg: 1},
              justifySelf: {lg: "end"},
              width: {xs: "100%", lg: guideTocWidthPx},
              maxWidth: "100%",
              position: {lg: "sticky"},
              top: {lg: 112},
            }}
          />

          <Box
            component="article"
            sx={{
              gridColumn: {lg: 2},
              minWidth: 0,
              width: "100%",
              maxWidth: guideArticleMaxWidth,
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
                  mb: {xs: 4, md: 5},
                }}
              >
                {index > 0 ? (
                  <Divider
                    sx={{
                      mb: 4,
                      borderColor: alpha(theme.palette.divider, 0.8),
                    }}
                  />
                ) : null}
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    mb: 2.5,
                    fontWeight: 600,
                    fontSize: {xs: "1.375rem", md: "1.5rem"},
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
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
        </Box>
      </Box>
    </Box>
  );
}
