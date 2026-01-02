import React, {useState, useCallback} from "react";
import {TextField, InputAdornment, Box, Paper, IconButton} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useNavigate} from "@tanstack/react-router";

export default function HeaderSearch() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = useCallback(() => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return;

    // Detect search type and navigate accordingly
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmedValue)) {
      // Could be a transaction hash or address
      // Try transaction first
      navigate({
        to: "/txn/$txnHashOrVersion",
        params: {txnHashOrVersion: trimmedValue},
      });
    } else if (/^\d+$/.test(trimmedValue)) {
      // Could be a transaction version or block height
      navigate({
        to: "/txn/$txnHashOrVersion",
        params: {txnHashOrVersion: trimmedValue},
      });
    } else if (/^0x[a-fA-F0-9]+$/.test(trimmedValue)) {
      // Likely an address
      navigate({to: "/account/$address", params: {address: trimmedValue}});
    } else {
      // Could be an ANS name or something else
      navigate({to: "/account/$address", params: {address: trimmedValue}});
    }

    setSearchValue("");
  }, [searchValue, navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
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
                  <IconButton onClick={handleSearch} edge="end">
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
