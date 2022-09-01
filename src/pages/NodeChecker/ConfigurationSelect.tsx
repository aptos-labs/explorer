import React, {useEffect, useState} from "react";
import {FormControl, Select, SelectChangeEvent} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";
import Box from "@mui/material/Box";
import {grey} from "../../themes/colors/aptosColorPalette";
import {determineNhcUrl, getConfigurationKeys} from "./Client";
import {useGlobalState} from "../../GlobalState";

interface ConfigurationSelectProps {
  baselineConfigurationKey: string | undefined;
  updateBaselineConfigurationKey: (key: string | undefined) => void;
  updateErrorMessage: (key: string | undefined) => void;
}

export default function ConfigurationSelect({
  baselineConfigurationKey,
  updateBaselineConfigurationKey,
  updateErrorMessage,
}: ConfigurationSelectProps) {
  const [state, _dispatch] = useGlobalState();

  const [validConfigurationKeys, updateValidConfigurationKeys] = useState<
    Map<string, string> | undefined
  >(undefined);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const configurationKey = event.target.value;
    updateBaselineConfigurationKey(configurationKey);
  };

  useEffect(() => {
    // Set the valid configuration keys.
    // This can change if the network selector changes.
    const nhcUrl = determineNhcUrl(state);
    getConfigurationKeys({nhcUrl: nhcUrl})
      .then((configurationKeys) => {
        updateValidConfigurationKeys(configurationKeys);
        updateBaselineConfigurationKey(configurationKeys.values().next().value);
        updateErrorMessage(undefined);
      })
      .catch((_error) => {
        updateErrorMessage(
          `Failed to connect to Node Health Checker at ${nhcUrl}`,
        );
        updateValidConfigurationKeys(undefined);
        updateBaselineConfigurationKey(undefined);
      });
  }, [state.network_name]);

  function DropdownIcon(props: SvgIconProps) {
    return (
      <SvgIcon {...props}>
        <path d="M16.6,9.7l-2.9,3c-1,1-2.8,1-3.8,0l-2.6-3l-0.8,0.7l2.6,3c0.7,0.7,1.6,1.1,2.6,1.1c1,0,2-0.4,2.6-1.1l2.9-3 L16.6,9.7z" />
      </SvgIcon>
    );
  }

  const theme = useTheme();

  let menuItems = null;
  if (validConfigurationKeys !== undefined) {
    menuItems = Array.from(validConfigurationKeys).map(
      ([configurationNamePretty, configurationKey]) => (
        <MenuItem key={configurationKey} value={configurationKey}>
          {configurationNamePretty}
        </MenuItem>
      ),
    );
  }

  return (
    <Box>
      <FormControl size="medium">
        <Select
          id="configuration-select"
          inputProps={{"aria-label": "Select Baseline Configuration"}}
          value={baselineConfigurationKey ? baselineConfigurationKey : ""}
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
            minWidth: 200,
            ml: 1,
            color: "inherit",
            alignItems: "center",
            "& .MuiSvgIcon-root": {
              color: theme.palette.text.secondary,
            },
          }}
          // Dropdown container overrides
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
            Select Baseline Configuration
          </MenuItem>
          {menuItems}
        </Select>
      </FormControl>
    </Box>
  );
}
