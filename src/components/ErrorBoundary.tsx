import React, {Component, ErrorInfo, ReactNode} from "react";
import {Alert, Box, Button, Container, Typography} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";

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
        <Container maxWidth="md" sx={{py: 4}}>
          <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{mb: 2}}
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                Try Again
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try refreshing the page."}
            </Typography>
            {import.meta.env.DEV && this.state.errorInfo && (
              <Box sx={{mt: 2, p: 2, bgcolor: "background.paper"}}>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{fontSize: "0.75rem"}}
                >
                  {this.state.error?.stack}
                </Typography>
              </Box>
            )}
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}
