import React, {useEffect} from "react";
import {
  FormControl,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import {defaultFeatureName, NetworkName, networks} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import {useTheme} from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {grey} from "../../themes/colors/aptosColorPalette";
import {Stack} from "@mui/system";
import useGetNetworkChainIds from "../../api/hooks/useGetNetworkChainIds";

// TODO: remove this flag upon gtm
// also reorder the networks
const SHOW_CHAIN_ID = false;

export default function NetworkSelect() {
  const [state, dispatch] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();
  const networkChainIds = useGetNetworkChainIds();

  function maybeSetNetwork(networkNameString: string | null) {
    if (!networkNameString || state.network_name === networkNameString) return;
    if (!(networkNameString in networks)) return;
    const feature_name = state.feature_name;
    const network_name = networkNameString as NetworkName;
    const network_value = networks[network_name];
    if (network_value) {
      // only show the "feature" param in the url when it's not "prod"
      // we don't want the users to know the existence of the "feature" param
      if (feature_name !== defaultFeatureName) {
        setSearchParams({network: network_name, feature: feature_name});
      } else {
        setSearchParams({network: network_name});
      }
      dispatch({network_name, network_value, feature_name});
    }
  }

  const handleChange = (event: SelectChangeEvent<string>) => {
    const network_name = event.target.value;
    maybeSetNetwork(network_name);
  };

  useEffect(() => {
    const network_name = searchParams.get("network");
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
          renderValue={(value) => <Typography>{value}</Typography>}
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
              },
            },
          }}
        >
          <MenuItem disabled value="">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={3}
              width="100%"
              color={grey[450]}
            >
              <Typography variant="body2">Network</Typography>
              {SHOW_CHAIN_ID && (
                <Typography variant="body2">Chain ID</Typography>
              )}
            </Stack>
          </MenuItem>
          {Object.keys(networks).map(
            (network_name: string) =>
              networkChainIds[network_name] && (
                <MenuItem key={network_name} value={network_name}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={3}
                    width="100%"
                  >
                    <Typography>{network_name}</Typography>
                    {SHOW_CHAIN_ID && (
                      <Typography
                        variant="body2"
                        sx={{color: theme.palette.text.disabled}}
                      >
                        {networkChainIds[network_name]}
                      </Typography>
                    )}
                  </Stack>
                </MenuItem>
              ),
          )}
        </Select>
      </FormControl>
    </Box>
  );
}
