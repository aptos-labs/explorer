import {
  FormControl,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";
import {useTheme, alpha} from "@mui/material";
import {Stack} from "@mui/system";
import React from "react";
import {
  useGetChainIdAndCache,
  useGetChainIdCached,
} from "../../api/hooks/useGetNetworkChainIds";
import {hiddenNetworks, NetworkName, networks} from "../../constants";
import {
  useNetworkName,
  useGlobalActions,
} from "../../global-config/GlobalConfig";

function NetworkAndChainIdCached({
  networkName,
  chainId,
}: {
  networkName: string;
  chainId: string | null;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={3}
      width="100%"
      paddingY={0.75}
    >
      <Typography>{networkName}</Typography>
      <Typography variant="body2" sx={{color: theme.palette.text.disabled}}>
        {chainId ?? "…"}
      </Typography>
    </Stack>
  );
}

function NetworkAndChainId({networkName}: {networkName: string}) {
  const chainId = useGetChainIdAndCache(networkName as NetworkName);

  return chainId ? (
    <NetworkAndChainIdCached networkName={networkName} chainId={chainId} />
  ) : null;
}

function NetworkMenuItem({networkName}: {networkName: string}) {
  const chainIdCached = useGetChainIdCached(networkName as NetworkName);
  if (hiddenNetworks.includes(networkName)) {
    return null;
  }

  return chainIdCached ? (
    <NetworkAndChainIdCached
      networkName={networkName}
      chainId={chainIdCached}
    />
  ) : (
    <NetworkAndChainId networkName={networkName} />
  );
}

export default function NetworkSelect() {
  const networkName = useNetworkName();
  const {selectNetwork} = useGlobalActions();
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent) => {
    const network_name = event.target.value;
    selectNetwork(network_name as NetworkName);
  };

  const visibleNetworkNames = React.useMemo(
    () => Object.keys(networks).filter((n) => !hiddenNetworks.includes(n)),
    [],
  );

  function DropdownIcon(props: SvgIconProps) {
    return (
      <SvgIcon {...props}>
        <path d="M16.6,9.7l-2.9,3c-1,1-2.8,1-3.8,0l-2.6-3l-0.8,0.7l2.6,3c0.7,0.7,1.6,1.1,2.6,1.1c1,0,2-0.4,2.6-1.1l2.9-3 L16.6,9.7z" />
      </SvgIcon>
    );
  }

  return (
    <Box>
      <FormControl size="small">
        <Select
          id="network-select"
          inputProps={{"aria-label": "Select Network"}}
          value={networkName}
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
            textTransform: "capitalize",
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
                boxShadow: `0 25px 50px -12px ${alpha(theme.palette.text.primary, 0.25)}`,
                marginTop: 0.5,
                "& .MuiMenuItem-root.Mui-selected": {
                  backgroundColor: `${
                    theme.palette.mode === "dark"
                      ? theme.palette.neutralShade.lighter
                      : theme.palette.neutralShade.darker
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
              color={theme.palette.text.secondary}
            >
              <Typography variant="body2">Network</Typography>
              <Typography variant="body2">Chain ID</Typography>
            </Stack>
          </MenuItem>

          {visibleNetworkNames.map((networkName) => (
            <MenuItem
              key={networkName}
              value={networkName}
              sx={{paddingY: 0, textTransform: "capitalize"}}
            >
              <NetworkMenuItem networkName={networkName} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
