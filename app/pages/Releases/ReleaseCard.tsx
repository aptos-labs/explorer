import {Box, Card, CardContent, Link, Typography} from "@mui/material";
import {formatDistanceToNow} from "date-fns";
import type {ReleaseResult} from "../../api/hooks/useGetReleases";

type ReleaseCardProps = {
  name: string;
  registry: string;
  result: ReleaseResult;
};

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
            <Typography variant="h5" fontFamily="monospace" gutterBottom>
              {result.version}
            </Typography>
            {result.publishedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
              >
                {formatDistanceToNow(new Date(result.publishedAt), {
                  addSuffix: true,
                })}
              </Typography>
            )}
            <Link href={result.link} target="_blank" rel="noopener noreferrer">
              View release →
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
