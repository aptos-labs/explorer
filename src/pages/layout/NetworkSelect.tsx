import {
  FormControl,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";
import {useTheme, styled} from "@mui/material/styles";
import {Stack} from "@mui/system";
import React from "react";
import {
  useGetChainIdAndCache,
  useGetChainIdCached,
} from "../../api/hooks/useGetNetworkChainIds";
import {NetworkName, networks} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {grey} from "../../themes/colors/aptosColorPalette";

interface CustomParams {
  restUrl: string;
  graphqlUrl: string;
}

export let customParameters: CustomParams = {restUrl: "", graphqlUrl: ""};

export const setCustomParameters = (params: CustomParams) => {
  customParameters = params;
};
//
export const getCustomParameters = () => {
  const restUrl = customParameters.restUrl;
  const graphqlUrl = customParameters.graphqlUrl;

  return {
    restUrl,
    graphqlUrl,
  };
};

function NetworkAndChainIdCached({
  networkName,
  chainId,
}: {
  networkName: string;
  chainId: string | null;
}) {
  const theme = useTheme();

  // rewrite the network name for display
  const nameRewrite = (networkName: string) => {
    if (networkName === "testnet") {
      return "suzuka testnet";
    } else if (networkName === "portoTestnet") {
      return "porto testnet";
    } else if (networkName === "bardockTestnet") {
      return "bardock testnet";
    } else {
      return networkName;
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={3}
      width="100%"
      paddingY={0.75}
    >
      <Typography>{nameRewrite(networkName)}</Typography>
      <Typography variant="body2" sx={{color: theme.palette.text.disabled}}>
        {chainId}
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

  return chainIdCached ? (
    <NetworkAndChainIdCached
      networkName={networkName}
      chainId={chainIdCached}
    />
  ) : (
    <NetworkAndChainId networkName={networkName} />
  );
}

const verifyUrl = (url: string) => {
  return url.startsWith("https://");
};

export default function NetworkSelect() {
  const [state, {selectNetwork}] = useGlobalState();
  const theme = useTheme();
  // eslint-disable-next-line
  const [restUrl, setRestUrl] = React.useState("");
  // eslint-disable-next-line
  const [graphqlUrl, setGraphqlUrl] = React.useState("");

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (event.target.value == "custom") {
      if (
        verifyUrl(customParameters.restUrl) &&
        verifyUrl(customParameters.graphqlUrl)
      ) {
        const network_name = event.target.value;
        selectNetwork(network_name as NetworkName);
      }
    } else {
      const network_name = event.target.value;
      selectNetwork(network_name as NetworkName);
    }
  };

  // eslint-disable-next-line
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (verifyUrl(restUrl) && verifyUrl(graphqlUrl)) {
      setCustomParameters({restUrl, graphqlUrl});
    }
  };

  function DropdownIcon(props: SvgIconProps) {
    return (
      <SvgIcon
        {...props}
        viewBox="0 0 13 8"
        sx={{
          fontSize: "12px",
        }}
      >
        <path
          d="M1 1L6.5 6.5L12 1"
          stroke="currentColor"
          strokeWidth="1.375"
          fill="none"
        />
      </SvgIcon>
    );
  }

  return (
    <Box>
      <FormControl size="small">
        <Select
          id="network-select"
          inputProps={{"aria-label": "Select Network"}}
          value={state.network_name}
          onChange={handleChange}
          renderValue={(value) => (
            <Typography sx={{fontSize: "0.875rem"}}>
              {value === "testnet" ? "suzuka testnet" : value}
            </Typography>
          )}
          onClose={() => {
            setTimeout(() => {
              (document.activeElement as HTMLElement)?.blur();
            }, 0);
          }}
          variant="outlined"
          autoWidth
          IconComponent={DropdownIcon}
          sx={{
            borderRadius: 0,
            fontWeight: "400",
            fontSize: "1rem",
            minWidth: 80,
            ml: 1,
            color: "inherit",
            alignItems: "center",
            textTransform: "capitalize",

            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            // Remove hover border
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            // Remove focus border
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSvgIcon-root": {
              color: theme.palette.text.secondary,
            },
          }}
          // dropdown container overrides
          MenuProps={{
            disableScrollLock: true,
            anchorOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
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
              <Typography variant="body2">Chain ID</Typography>
            </Stack>
          </MenuItem>
          {/* {Object.keys(networks)
            .filter((networkName) =>
              useGetChainIdCached(networkName as NetworkName),
            )
            .map((networkName: string) => (
              <MenuItem
                key={networkName}
                value={networkName}
                sx={{paddingY: 0, textTransform: "capitalize"}}
              >
                <NetworkMenuItem networkName={networkName} />
              </MenuItem>
            ))} */}
          {Object.keys(networks).map((networkName: string) => (
            <MenuItem
              key={networkName}
              value={networkName}
              sx={{paddingY: 0, textTransform: "capitalize"}}
            >
              <NetworkMenuItem networkName={networkName} />
            </MenuItem>
          ))}

          {/* <MenuItem
           key={"custom"}
           value={"custom"}
           sx={{paddingY: 0, textTransform: "capitalize"}}
           >
            Custom
            {openCustom && <form onSubmit={handleSubmit}>
              <div>
                <label>REST</label>
                <input type="text" value={restUrl} onChange={(e) => setRestUrl(e.target.value)} />
              </div>
              <div>
                <label>GraphQL</label>
                <input type="text" value={graphqlUrl} onChange={(e) => setGraphqlUrl(e.target.value)} />
              </div>
              <button type="submit">Submit</button>
            </form>}
           </MenuItem> */}
        </Select>
      </FormControl>
    </Box>
  );
}
