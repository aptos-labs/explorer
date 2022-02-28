import React from "react";
import Box from "@mui/material/Box";
import {FormControl, InputLabel, Select, SelectChangeEvent} from "@mui/material";
import {networks} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import {alpha, styled} from "@mui/material/styles";
import {useLocation} from "react-router-dom";

const Holder = styled(Box)(({theme}) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  minWidth: 160,
  maxHeight: 39,
}));

export default function NetworkSelect() {
  const [state, dispatch] = useGlobalState();

  const handleChange = (event: SelectChangeEvent) => {
    const network_name: string = event.target.value as string;
    const network_value = networks[network_name];
    dispatch({network_name, network_value});
  };

  const label = (<InputLabel style={{color: "inherit"}}>Network</InputLabel>);
  return (
    <Holder>
      <FormControl size="small" fullWidth variant="outlined">
        {label}
        <Select
          native
          style={{color: "inherit"}}
          id="network-select"
          label={label}
          value={state.network_name}
          onChange={handleChange}
        >
          {Object.keys(networks).map((network_name: string) => (
            <option key={network_name} value={network_name}>{network_name}</option>
          ))}
        </Select>
      </FormControl>
    </Holder>
  );
}