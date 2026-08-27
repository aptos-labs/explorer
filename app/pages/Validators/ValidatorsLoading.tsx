import {Box, CircularProgress, Typography} from "@mui/material";

/** Progress indicator while ValidatorSet / validator stats are still loading. */
export function ValidatorsLoading() {
  return (
    <Box
      role="status"
      aria-label="Loading validators"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress size={32} />
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
        Loading validators...
      </Typography>
    </Box>
  );
}
