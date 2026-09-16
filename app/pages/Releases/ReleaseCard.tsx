import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {useTranslation} from "../../i18n";
import type {ReleaseResult} from "../../api/hooks/useGetReleases";

type ReleaseCardProps = {
  name: string;
  registry: string;
  result: ReleaseResult;
};

function PrereleaseBadge() {
  const {t} = useTranslation();
  return (
    <Chip
      label={t("releasesUi.prerelease")}
      color="warning"
      size="small"
      variant="outlined"
      sx={{ml: 1, fontSize: "0.65rem", height: 20}}
    />
  );
}

function RelativeDate({iso}: {iso: string | null}) {
  const {formatDateTime} = useTranslation();
  if (!iso) return null;
  return (
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
      }}
    >
      {formatDateTime(new Date(iso))}
    </Typography>
  );
}

export function ReleaseCard({name, registry, result}: ReleaseCardProps) {
  const {t} = useTranslation();
  return (
    <Card variant="outlined" sx={{height: "100%"}}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mb: 1,
          }}
        >
          {registry}
        </Typography>

        {result.status === "error" ? (
          <Typography variant="body2" color="error">
            {result.message}
          </Typography>
        ) : (
          <Box>
            <Box sx={{display: "flex", alignItems: "center", flexWrap: "wrap"}}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "monospace",
                }}
              >
                {result.version}
              </Typography>
              {!result.isStable && <PrereleaseBadge />}
            </Box>
            {result.publishedAt && (
              <Box sx={{mt: 0.5, mb: 1}}>
                <RelativeDate iso={result.publishedAt} />
              </Box>
            )}
            {result.isStable ? (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  mb: 1,
                }}
              >
                {t("releasesUi.latestStable")}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: "warning.main",
                  display: "block",
                  mb: 1,
                }}
              >
                {t("releasesUi.noStable")}
              </Typography>
            )}
            <Link href={result.link} target="_blank" rel="noopener noreferrer">
              {t("releasesUi.viewRelease")}
            </Link>

            {result.recent.length > 0 && (
              <Accordion
                disableGutters
                elevation={0}
                square
                sx={{
                  background: "transparent",
                  "&:before": {display: "none"},
                  mt: 1,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon fontSize="small" />}
                  sx={{px: 0, minHeight: 32}}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {t("releasesUi.recentReleases", {
                      count: result.recent.length,
                    })}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{px: 0, pt: 0, overflowX: "auto"}}>
                  <Table
                    size="small"
                    aria-label={t("releasesUi.recentAria", {name})}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{pl: 0}}>
                          {t("releasesUi.version")}
                        </TableCell>
                        <TableCell sx={{whiteSpace: "nowrap"}}>
                          {t("releasesUi.published")}
                        </TableCell>
                        <TableCell sx={{pr: 0}} align="right">
                          {t("releasesUi.link")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.recent.map((entry) => (
                        <TableRow key={entry.version} hover>
                          <TableCell
                            sx={{
                              pl: 0,
                              fontFamily: "monospace",
                              wordBreak: "break-word",
                            }}
                          >
                            {entry.version}
                            {entry.isPrerelease && <PrereleaseBadge />}
                          </TableCell>
                          <TableCell sx={{whiteSpace: "nowrap"}}>
                            <RelativeDate iso={entry.publishedAt} />
                          </TableCell>
                          <TableCell sx={{pr: 0}} align="right">
                            <Link
                              href={entry.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {t("common.view")}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
