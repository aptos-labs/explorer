import {Box, Button, Stack, Typography, useTheme} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {grey, primary} from "../../themes/colors/aptosColorPalette";

const STAKING_URL = "https://staking.movementnetwork.xyz";

export function StakingPromo() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleClick = () => {
    window.open(STAKING_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      sx={{
        background: isDark
          ? `linear-gradient(135deg, ${grey[800]} 0%, ${grey[700]} 100%)`
          : `linear-gradient(135deg, ${grey[100]} 0%, ${grey[200]} 100%)`,
        borderRadius: 2,
        padding: {xs: 2, md: 3},
        marginBottom: 6,
        border: `1px solid ${isDark ? grey[600] : grey[300]}`,
      }}
    >
      <Stack
        direction={{xs: "column", sm: "row"}}
        justifyContent="space-between"
        alignItems={{xs: "flex-start", sm: "center"}}
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              backgroundColor: primary[500],
              color: grey[900],
              borderRadius: 1,
              paddingX: 1.5,
              paddingY: 0.5,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            STAKE
          </Box>
          <Typography
            sx={{
              color: isDark ? grey[100] : grey[800],
              fontSize: {xs: "0.9rem", md: "1rem"},
            }}
          >
            Delegate your MOVE tokens to help secure the Movement Network and Earn Rewards
          </Typography>
        </Stack>
        <Button
          variant="contained"
          onClick={handleClick}
          sx={{
            backgroundColor: primary[500],
            color: grey[900],
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 1,
            paddingX: 3,
            "&:hover": {
              backgroundColor: primary[400],
            },
          }}
          endIcon={<ArrowForwardIosIcon sx={{fontSize: "0.8rem !important"}} />}
        >
          Stake Now
        </Button>
      </Stack>
    </Box>
  );
}
