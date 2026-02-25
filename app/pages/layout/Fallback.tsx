import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import {type ReactNode, useEffect, useState} from "react";

export function Fallback() {
  const [fallback, setFallback] = useState<ReactNode | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(
      () =>
        setFallback(
          <Container
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Container>,
        ),
      250,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return fallback;
}
