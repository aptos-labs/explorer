/**
 * Navigation pending component shown during route transitions.
 * This is displayed when navigating between routes while data is loading.
 */
import React from "react";
import {Box, LinearProgress, Fade} from "@mui/material";

export function NavigationPending() {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <LinearProgress
          sx={{
            height: 3,
            "& .MuiLinearProgress-bar": {
              backgroundColor: "primary.main",
            },
          }}
        />
      </Box>
    </Fade>
  );
}

/**
 * Page-level pending component with skeleton content.
 * Used when a specific route is loading its data.
 */
export function PagePending() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "40%",
          height: 40,
          backgroundColor: "action.hover",
          borderRadius: 1,
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": {opacity: 0.4},
            "50%": {opacity: 0.7},
          },
        }}
      />
      <Box sx={{display: "flex", gap: 2}}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 100,
              backgroundColor: "action.hover",
              borderRadius: 1,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          width: "100%",
          height: 300,
          backgroundColor: "action.hover",
          borderRadius: 1,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    </Box>
  );
}
