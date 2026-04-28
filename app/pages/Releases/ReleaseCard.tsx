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
import {formatDistanceToNow} from "date-fns";
import type {ReleaseResult} from "../../api/hooks/useGetReleases";

type ReleaseCardProps = {
  name: string;
  registry: string;
  result: ReleaseResult;
};

function PrereleaseBadge() {
  return (
    <Chip
      label="Pre-release"
      color="warning"
      size="small"
      variant="outlined"
      sx={{ml: 1, fontSize: "0.65rem", height: 20}}
    />
  );
}

function RelativeDate({iso}: {iso: string | null}) {
  if (!iso) return null;
  return (
    <Typography variant="caption" color="text.secondary">
      {formatDistanceToNow(new Date(iso), {addSuffix: true})}
    </Typography>
  );
}

export function ReleaseCard({name, registry, result}: ReleaseCardProps) {
  return (
    <Card variant="outlined" sx={{height: "100%"}}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mb={1}
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
              <Typography variant="h5" fontFamily="monospace">
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
                color="text.secondary"
                display="block"
                mb={1}
              >
                Latest stable release
              </Typography>
            ) : (
              <Typography
                variant="caption"
                color="warning.main"
                display="block"
                mb={1}
              >
                No stable release found — showing latest pre-release
              </Typography>
            )}
            <Link href={result.link} target="_blank" rel="noopener noreferrer">
              View release →
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
                  <Typography variant="body2" color="text.secondary">
                    Recent releases ({result.recent.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{px: 0, pt: 0, overflowX: "auto"}}>
                  <Table size="small" aria-label={`Recent ${name} releases`}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{pl: 0}}>Version</TableCell>
                        <TableCell sx={{whiteSpace: "nowrap"}}>
                          Published
                        </TableCell>
                        <TableCell sx={{pr: 0}} align="right">
                          Link
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
                              View
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
