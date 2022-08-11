import React, {useEffect} from "react";
import {FormControl, Select, SelectChangeEvent} from "@mui/material";
import {ExplorerNetworks, networks} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import {useTheme} from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {grey} from "../../themes/colors/aptosColorPalette";

export default function NetworkSelect() {
  const [state, dispatch] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();

  function maybeSetNetwork(network_name: ExplorerNetworks | null) {
    if (!network_name || state.network_name === network_name) return;
    const network_value = networks[network_name];
    if (network_value) {
      setSearchParams({network: network_name});
      dispatch({network_name, network_value});
    }
  }

  const handleChange = (event: SelectChangeEvent) => {
    const selectedNetwork = event.target.value as string;
    if(!selectedNetwork) return;
    const network_name = selectedNetwork.toLowerCase() as ExplorerNetworks;
    maybeSetNetwork(network_name);
  };

  useEffect(() => {
    const selectedNetwork = searchParams.get("network");
    if(!selectedNetwork) return;
    const network_name = selectedNetwork.toLowerCase() as ExplorerNetworks;
    maybeSetNetwork(network_name);
  });

  function DropdownIcon(props: SvgIconProps) {
    return (
      <SvgIcon {...props}>
        <path d="M16.6,9.7l-2.9,3c-1,1-2.8,1-3.8,0l-2.6-3l-0.8,0.7l2.6,3c0.7,0.7,1.6,1.1,2.6,1.1c1,0,2-0.4,2.6-1.1l2.9-3 L16.6,9.7z" />
      </SvgIcon>
    );
  }

  const theme = useTheme();

  return (
    <Box>
      <FormControl size="small">
        <Select
          id="network-select"
          inputProps={{"aria-label": "Select Network"}}
          value={state.network_name}
          onChange={handleChange}
          onClose={() => {
            setTimeout(() => {
              (document.activeElement as HTMLElement)?.blur();
            }, 0);
          }}
          variant="outlined"
          autoWidth
          IconComponent={DropdownIcon}
          sx={{
            borderRadius: 1,
            fontWeight: "400",
            fontSize: "1rem",
            minWidth: 80,
            ml: 1,
            color: "inherit",
            alignItems: "center",
            "& .MuiSvgIcon-root": {
              color: theme.palette.text.secondary,
            },
          }}
          // dropdown container overrides
          MenuProps={{
            disableScrollLock: true,
            PaperProps: {
              sx: {
                minWidth: 240,
                boxShadow: "0 25px 50px -12px rgba(18,22,21,0.25)",
                marginTop: 0.5,
                "& .MuiMenuItem-root.Mui-selected": {
                  backgroundColor: `${
                    theme.palette.mode === "dark" ? grey[700] : grey[200]
                  }!important`,
                  pointerEvents: "none",
                },
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: "transparent",
                  color: `${theme.palette.primary.main}`,
                },
              },
            },
          }}
        >
          <MenuItem disabled value="">
            Select Network
          </MenuItem>
          {Object.keys(networks).map((network_name: string) => (
            <MenuItem key={network_name} value={network_name}>
              {network_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
