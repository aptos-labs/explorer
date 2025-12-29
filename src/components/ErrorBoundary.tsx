import React, {Component, ErrorInfo, ReactNode} from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";
import ContentBox from "./IndividualPageContent/ContentBox";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Report to Sentry if available
    if (typeof window !== "undefined" && "Sentry" in window) {
      const Sentry = (window as {Sentry?: typeof import("@sentry/react")})
        .Sentry;
      if (Sentry && typeof Sentry.captureException === "function") {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryContent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorBoundaryContent({
  error,
  errorInfo,
  onReset,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}) {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{py: 4}}>
      <ContentBox>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <ErrorOutline
            sx={{
              color: theme.palette.error.main,
              fontSize: 28,
              mt: 0.5,
            }}
          />
          <Stack spacing={2} sx={{flex: 1}}>
            <Stack spacing={1}>
              <Typography variant="h6" color="error">
                Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {error?.message ||
                  "An unexpected error occurred. Please try refreshing the page."}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              onClick={onReset}
              sx={{alignSelf: "flex-start"}}
            >
              Try Again
            </Button>
            {import.meta.env.DEV && errorInfo && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    overflow: "auto",
                  }}
                >
                  {error?.stack}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </ContentBox>
    </Container>
  );
}
