import React, { useEffect } from "react";
import { FormControl, Select, SelectChangeEvent } from "@mui/material";
import { networks } from "../../constants";
import { useGlobalState } from "../../GlobalState";
import { useTheme } from "@mui/material/styles";
import MenuItem from '@mui/material/MenuItem';
import { grey } from '@mui/material/colors';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Box from "@mui/material/Box";
import { createSearchParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function NetworkSelect() {
  const [state, dispatch] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  function maybeSetNetwork(network_name: string | null) {
    if (!network_name || state.network_name === network_name)
      return;
    const network_value = networks[network_name];
    if (network_value) {

      if(network_name === 'governance'){
        // redirect to /governance
        navigate('/governance');
      }else{
        const path = location.pathname === '/governance' ? '/' :  location.pathname
        navigate({
          pathname: path,
          search: `?${createSearchParams({
            network: network_name
          })}`
      });
      }
      dispatch({ network_name, network_value });
    }
  }

  const handleChange = (event: SelectChangeEvent) => {
    const network_name = event.target.value as string;
    maybeSetNetwork(network_name && network_name.toLowerCase());
  };

  useEffect(() => {
    const network_name = searchParams.get("network");
    maybeSetNetwork(network_name && network_name.toLowerCase());
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
          inputProps={{ 'aria-label': 'Select Network' }}
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
            fontWeight: '400',
            minWidth: 110,
            ml: 1,
            color: '#ffffff',
            alignItems: 'center',
            "& .MuiSvgIcon-root": {
              color: "inherit",
            },
            "&& fieldset": {
              border: `1px solid ${theme.palette.mode === 'dark' ? grey[500] : grey[100]}`
            },
            "&:hover": {
              backgroundColor: grey[900],
              "&& fieldset": {
                border: `1px solid ${theme.palette.mode === 'dark' ? grey[100] : grey[100]}`
              }
            },
            "&.Mui-focused": {
              backgroundColor: grey[900],
            },
          }}
          // dropdown container overrides
          MenuProps={{
            disableScrollLock: true,
            PaperProps: {
              sx: {
                minWidth: 240,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                marginTop: '8px',
                "& .MuiMenuItem-root.Mui-selected": {
                  backgroundColor: `${theme.palette.mode === 'dark' ? grey[800] : grey[200]}!important`,
                  pointerEvents: 'none'
                },
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: `${theme.palette.primary.main}`,
                  color: grey[900],
                },
              }
            }
          }}
        >
          <MenuItem disabled value="">
            Select Network
          </MenuItem>
          {Object.keys(networks).map((network_name: string) => (
            <MenuItem
              key={network_name}
              value={network_name}
            >
              {network_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
