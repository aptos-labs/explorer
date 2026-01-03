import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
} from "@mui/material";
import {useNetworkSelector} from "../../global-config";
import {networks, NetworkName, hiddenNetworks} from "../../constants";

export default function NetworkSelect() {
  const theme = useTheme();
  const [networkName, setNetworkName] = useNetworkSelector();

  const handleChange = (event: SelectChangeEvent) => {
    const newNetwork = event.target.value as NetworkName;
    setNetworkName(newNetwork);
  };

  // Filter out hidden networks for the dropdown
  const visibleNetworks = Object.keys(networks).filter(
    (network) => !hiddenNetworks.includes(network as NetworkName),
  ) as NetworkName[];

  return (
    <FormControl size="small" sx={{ml: 2, minWidth: 120}}>
      <Select
        value={networkName}
        onChange={handleChange}
        displayEmpty
        sx={{
          color: theme.palette.text.primary,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "& .MuiSelect-select": {
            py: 1,
            textTransform: "capitalize",
          },
        }}
      >
        {visibleNetworks.map((network) => (
          <MenuItem
            key={network}
            value={network}
            sx={{textTransform: "capitalize"}}
          >
            {network}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
