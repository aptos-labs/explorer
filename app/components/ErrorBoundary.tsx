import RefreshIcon from "@mui/icons-material/Refresh";
import {Box, Button, Card, CardContent, Typography} from "@mui/material";
import {useTranslation} from "../i18n";
import {Link} from "../routing";
import {isModuleFetchError} from "../utils/moduleErrorHandler";

interface ErrorBoundaryProps {
  error: Error;
  reset?: () => void;
}

export function ErrorBoundary({error, reset}: ErrorBoundaryProps) {
  const isModuleError = isModuleFetchError(error);
  const {t} = useTranslation();

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
              {t("errors.updateAvailable")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 3,
              }}
            >
              {t("errors.updateAvailableBody")}
            </Typography>
            <Box sx={{display: "flex", gap: 2, justifyContent: "center"}}>
              <Button
                variant="contained"
                onClick={handleReload}
                startIcon={<RefreshIcon />}
              >
                {t("common.refreshPage")}
              </Button>
              {/* Use native anchor tag instead of Link component for module errors,
                  since the router may also be affected by the chunk loading failure */}
              <Button component="a" href="/" variant="outlined">
                {t("common.goHome")}
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
            {t("errors.somethingWentWrong")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 3,
            }}
          >
            {error.message || t("errors.unexpected")}
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
                {t("common.tryAgain")}
              </Button>
            )}
            <Button component={Link} to="/" variant="outlined">
              {t("common.goHome")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export function NotFoundError() {
  const {t} = useTranslation();
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
            {t("errors.pageNotFound")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 3,
            }}
          >
            {t("errors.pageNotFoundBody")}
          </Typography>
          <Button component={Link} to="/" variant="contained">
            {t("common.goHome")}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
