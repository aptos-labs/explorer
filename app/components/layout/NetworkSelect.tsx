import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
} from "@mui/material";
import {useLocation} from "@tanstack/react-router";
import {useNetworkSelector} from "../../global-config";
import {networks, NetworkName, hiddenNetworks} from "../../constants";
import {useLocalnetDetection} from "../../hooks/useLocalnetDetection";
import {useNavigate} from "../../routing";

export default function NetworkSelect() {
  const theme = useTheme();
  const [networkName, setNetworkName] = useNetworkSelector();
  const {isAvailable: isLocalnetAvailable} = useLocalnetDetection();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event: SelectChangeEvent) => {
    const newNetwork = event.target.value as NetworkName;
    setNetworkName(newNetwork);

    // Also update the URL to reflect the new network
    // This ensures the URL param and cookie stay in sync
    navigate({
      to: location.pathname,
      search: {network: newNetwork},
      replace: true,
    });
  };

  // Filter out hidden networks for the dropdown options
  const visibleNetworks = Object.keys(networks).filter(
    (network) => !hiddenNetworks.includes(network as NetworkName),
  ) as NetworkName[];

  // Check if current network is a hidden network (but not local if it's available)
  const isHiddenNetwork =
    hiddenNetworks.includes(networkName) &&
    !(networkName === "local" && isLocalnetAvailable);

  // Custom render for the selected value to show hidden network names
  const renderValue = (selected: string) => {
    // Display "localnet" instead of "local" for better UX
    const displayName = selected === "local" ? "localnet" : selected;
    return <span style={{textTransform: "capitalize"}}>{displayName}</span>;
  };

  return (
    <FormControl size="small" sx={{ml: 2, minWidth: 120}}>
      <Select
        value={networkName}
        onChange={handleChange}
        displayEmpty
        renderValue={renderValue}
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
          },
        }}
      >
        {/* Hidden MenuItem for when a private network is selected - needed for MUI value lookup */}
        {isHiddenNetwork && (
          <MenuItem
            key={networkName}
            value={networkName}
            sx={{display: "none"}}
          >
            {networkName}
          </MenuItem>
        )}
        {visibleNetworks.map((network) => (
          <MenuItem
            key={network}
            value={network}
            sx={{textTransform: "capitalize"}}
          >
            {network}
          </MenuItem>
        ))}
        {/* Show localnet option when detected */}
        {isLocalnetAvailable && (
          <MenuItem
            key="local"
            value="local"
            sx={{textTransform: "capitalize"}}
          >
            localnet
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
