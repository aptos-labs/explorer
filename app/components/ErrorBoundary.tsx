import React from "react";
import {Box, Typography, Button, Card, CardContent} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {Link} from "../routing";
import {isModuleFetchError} from "../utils/moduleErrorHandler";

interface ErrorBoundaryProps {
  error: Error;
  reset?: () => void;
}

export function ErrorBoundary({error, reset}: ErrorBoundaryProps) {
  const isModuleError = isModuleFetchError(error);

  const handleReload = () => {
    window.location.reload();
  };

  // Show a friendlier message for module loading errors.
  // Note: The global error handler (setupModuleErrorHandler) catches most module errors
  // before they reach this boundary. This UI serves as a fallback for errors that occur
  // during React rendering or when the global handler has exhausted its reload attempts.
  if (isModuleError) {
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
            <Typography variant="h4" gutterBottom color="primary">
              Update Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
              A new version of the explorer has been deployed. Please refresh
              the page to load the latest version.
            </Typography>
            <Box sx={{display: "flex", gap: 2, justifyContent: "center"}}>
              <Button
                variant="contained"
                onClick={handleReload}
                startIcon={<RefreshIcon />}
              >
                Refresh Page
              </Button>
              {/* Use native anchor tag instead of Link component for module errors,
                  since the router may also be affected by the chunk loading failure */}
              <Button component="a" href="/" variant="outlined">
                Go Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
