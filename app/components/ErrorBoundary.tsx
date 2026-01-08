import React from "react";
import {Box, Typography, Button, Card, CardContent} from "@mui/material";
import {Link} from "../routing";

interface ErrorBoundaryProps {
  error: Error;
  reset?: () => void;
}

export function ErrorBoundary({error, reset}: ErrorBoundaryProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        p: 3,
      }}
    >
      <Card sx={{maxWidth: 500, textAlign: "center"}}>
        <CardContent>
          <Typography variant="h4" gutterBottom color="error">
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
            {error.message || "An unexpected error occurred"}
          </Typography>
          {process.env.NODE_ENV === "development" && (
            <Box
              component="pre"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: "background.default",
                borderRadius: 1,
                overflow: "auto",
                textAlign: "left",
                fontSize: "0.75rem",
              }}
            >
              {error.stack}
            </Box>
          )}
          <Box sx={{display: "flex", gap: 2, justifyContent: "center"}}>
            {reset && (
              <Button variant="contained" onClick={reset}>
                Try Again
              </Button>
            )}
            <Button component={Link} to="/" variant="outlined">
              Go Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export function NotFoundError() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        p: 3,
      }}
    >
      <Card sx={{maxWidth: 500, textAlign: "center"}}>
        <CardContent>
          <Typography variant="h1" sx={{fontSize: "6rem", fontWeight: 700}}>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Go Home
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
