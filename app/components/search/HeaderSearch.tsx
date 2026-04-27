import SearchIcon from "@mui/icons-material/Search";
import {Box, IconButton, InputAdornment, Paper, TextField} from "@mui/material";
import type React from "react";
import {useCallback, useState} from "react";
import {useNavigate} from "~/routing";

export default function HeaderSearch() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = useCallback(async () => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return;

    // Detect search type and navigate accordingly
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmedValue)) {
      // Could be a transaction hash or address
      // Try transaction first
      await navigate({
        to: "/txn/$txnHashOrVersion",
        params: {txnHashOrVersion: trimmedValue},
      });
    } else if (/^\d+$/.test(trimmedValue)) {
      // Could be a transaction version or block height
      await navigate({
        to: "/txn/$txnHashOrVersion",
        params: {txnHashOrVersion: trimmedValue},
      });
    } else if (/^0x[a-fA-F0-9]+$/.test(trimmedValue)) {
      // Likely an address
      await navigate({
        to: "/account/$address",
        params: {address: trimmedValue},
      });
    } else {
      // Could be an ANS name or something else
      await navigate({
        to: "/account/$address",
        params: {address: trimmedValue},
      });
    }

    setSearchValue("");
  }, [searchValue, navigate]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        await handleSearch();
      }
    },
    [handleSearch],
  );

  return (
    <Box sx={{mb: 4}}>
      <Paper
        elevation={0}
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <TextField
          fullWidth
          aria-label="Search by address, transaction hash, block height, or version"
          placeholder="Search by address, transaction hash, block height, or version..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Search"
                    onClick={handleSearch}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Paper>
    </Box>
  );
}
