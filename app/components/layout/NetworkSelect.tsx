import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Tooltip,
  useTheme,
} from "@mui/material";
import {useLocation} from "@tanstack/react-router";
import {useState} from "react";
import {hiddenNetworks, type NetworkName, networks} from "../../constants";
import {useNetworkSelector} from "../../global-config";
import {translateNetworkName, useTranslation} from "../../i18n";
import {useNavigate} from "../../routing";

export function networkStatusPaletteKey(
  networkName: string,
): "success" | "warning" | "info" | "disabled" {
  switch (networkName) {
    case "mainnet":
      return "success";
    case "testnet":
      return "warning";
    case "devnet":
      return "info";
    default:
      return "disabled";
  }
}

function NetworkStatusDot({networkName}: {networkName: string}) {
  const theme = useTheme();
  const statusKey = networkStatusPaletteKey(networkName);
  const bgcolor =
    statusKey === "disabled"
      ? theme.palette.text.disabled
      : theme.palette[statusKey].main;

  return (
    <Box
      data-network-status={networkName}
      aria-hidden
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor,
        flexShrink: 0,
      }}
    />
  );
}

export default function NetworkSelect() {
  const theme = useTheme();
  const {t} = useTranslation();
  const [networkName, setNetworkName] = useNetworkSelector();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tooltipHover, setTooltipHover] = useState(false);

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
    <FormControl
      size="small"
      sx={{minWidth: 0, maxWidth: {xs: "42vw", sm: "none"}, flexShrink: 0}}
    >
      <Tooltip
        title={t("network.selectTitle")}
        open={!menuOpen && tooltipHover}
        onOpen={() => setTooltipHover(true)}
        onClose={() => setTooltipHover(false)}
        disableTouchListener
      >
        <Select
          value={networkName}
          onChange={handleChange}
          onOpen={() => setMenuOpen(true)}
          onClose={() => {
            setMenuOpen(false);
            setTooltipHover(false);
          }}
          displayEmpty
          inputProps={{"aria-label": t("network.selectAriaLabel")}}
          renderValue={renderValue}
          startAdornment={
            <InputAdornment
              position="start"
              sx={{ml: 0.5, mr: 1, pointerEvents: "none"}}
            >
              <NetworkStatusDot networkName={networkName} />
            </InputAdornment>
          }
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
              pr: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
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
            <MenuItem key={network} value={network} sx={{gap: 1}}>
              <NetworkStatusDot networkName={network} />
              {translateNetworkName(network, t)}
            </MenuItem>
          ))}
          {/* Always show localnet option - user must explicitly select it to trigger local device detection */}
          <MenuItem key="local" value="local" sx={{gap: 1}}>
            <NetworkStatusDot networkName="local" />
            {t("network.localnet")}
          </MenuItem>
        </Select>
      </Tooltip>
    </FormControl>
  );
}
