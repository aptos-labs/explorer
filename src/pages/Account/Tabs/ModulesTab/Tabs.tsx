import {Box, useTheme} from "@mui/material";
import React from "react";
import {useParams} from "react-router-dom";
import StyledTab from "../../../../components/StyledTab";
import StyledTabs from "../../../../components/StyledTabs";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {assertNever} from "../../../../utils";
import ViewCode from "./ViewCode";
import Contract from "./Contract";
import {useNavigate} from "../../../../routing";

const TabComponents = Object.freeze({
  code: ViewCode,
  write: WriteContract,
  read: ReadContract,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "code":
      return "View Code";
    case "write":
      return "Write";
    case "read":
      return "Read";
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
};

function WriteContract({address}: {address: string}) {
  return <Contract address={address} isRead={false} />;
}

function ReadContract({address}: {address: string}) {
  return <Contract address={address} isRead />;
}

function TabPanel({value, address}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} />;
}

function ModulesTabs({address}: {address: string}): JSX.Element {
  const theme = useTheme();
  const tabValues = Object.keys(TabComponents) as TabValue[];
  const {selectedModuleName, modulesTab} = useParams();
  const navigate = useNavigate();
  const value =
    modulesTab === undefined ? tabValues[0] : (modulesTab as TabValue);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/account/${address}/modules/${newValue}/${selectedModuleName}`);
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box
        padding={2}
        marginY={4}
        borderColor="red"
        borderRadius={1}
        bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      >
        <StyledTabs value={value} onChange={handleChange}>
          {tabValues.map((value, i) => (
            <StyledTab
              key={i}
              value={value}
              label={getTabLabel(value)}
              isFirst={i === 0}
              isLast={i === tabValues.length - 1}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box>
        <TabPanel value={value} address={address} />
      </Box>
    </Box>
  );
}

export default ModulesTabs;
