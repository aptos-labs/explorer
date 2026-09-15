import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  useTheme,
} from "@mui/material";
import {useLocation} from "@tanstack/react-router";
import {hiddenNetworks, type NetworkName, networks} from "../../constants";
import {useNetworkSelector} from "../../global-config";
import {translateNetworkName, useTranslation} from "../../i18n";
import {useNavigate} from "../../routing";

export default function NetworkSelect() {
  const theme = useTheme();
  const {t} = useTranslation();
  const [networkName, setNetworkName] = useNetworkSelector();
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

  // Filter out hidden networks and "local" (shown separately as "Localnet")
  const visibleNetworks = Object.keys(networks).filter(
    (network) =>
      !hiddenNetworks.includes(network as NetworkName) && network !== "local",
  ) as NetworkName[];

  // Check if current network is a hidden network (excluding local which is always shown)
  const isHiddenNetwork =
    hiddenNetworks.includes(networkName) && networkName !== "local";

  // Custom render for the selected value to show hidden network names
  const renderValue = (selected: string) => {
    return <span>{translateNetworkName(selected, t)}</span>;
  };

  return (
    <FormControl size="small" sx={{minWidth: 120, flexShrink: 0}}>
      <Select
        value={networkName}
        onChange={handleChange}
        displayEmpty
        inputProps={{"aria-label": t("network.selectAriaLabel")}}
        renderValue={renderValue}
        MenuProps={{
          disableScrollLock: true,
          disableAutoFocusItem: true,
          disableRestoreFocus: true,
        }}
        sx={{
          color: theme.palette.text.primary,
          touchAction: "manipulation",
          "& .MuiSelect-icon": {pointerEvents: "none"},
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
            {translateNetworkName(networkName, t)}
          </MenuItem>
        )}
        {visibleNetworks.map((network) => (
          <MenuItem key={network} value={network}>
            {translateNetworkName(network, t)}
          </MenuItem>
        ))}
        {/* Always show localnet option - user must explicitly select it to trigger local device detection */}
        <MenuItem key="local" value="local">
          {t("network.localnet")}
        </MenuItem>
      </Select>
    </FormControl>
  );
}
