import {Box, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import ValidatorsMap from "./ValidatorsMap";
import {ValidatorsTable} from "./ValidatorsTable";

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();
  const [onDelegatory, setOnDelegatory] = useState<boolean>(false);
  const inDev = useGetInDevMode();

  const handleTabChange = (
    _event: React.MouseEvent<HTMLElement>,
    onDelegatory: boolean,
  ) => {
    setOnDelegatory(onDelegatory);
  };

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {state.network_name === "mainnet" ? (
        <>
          <ValidatorsMap />
          {inDev && (
            <ToggleButtonGroup
              sx={{
                width: "100%",
                "@media screen and (min-width: 40em)": {
                  width: "40%",
                },
              }}
              fullWidth={true}
              size="large"
              value={onDelegatory}
              onChange={handleTabChange}
              exclusive={true}
            >
              <ToggleButton value={false}>
                <Typography sx={{textTransform: "capitalize"}}>
                  All Nodes
                </Typography>
              </ToggleButton>
              <ToggleButton value={true}>
                <Typography sx={{textTransform: "capitalize"}}>
                  Delegation Nodes
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <ValidatorsTable onDelegatory={onDelegatory} />
          </Box>
        </>
      ) : (
        <>
          {inDev && (
            <ToggleButtonGroup
              sx={{
                width: "100%",
                "@media screen and (min-width: 40em)": {
                  width: "40%",
                },
              }}
              fullWidth={true}
              size="large"
              exclusive={true}
              value={onDelegatory}
              onChange={handleTabChange}
            >
              <ToggleButton value={false}>
                <Typography sx={{textTransform: "capitalize"}}>
                  All Nodes
                </Typography>
              </ToggleButton>
              <ToggleButton value={true}>
                <Typography sx={{textTransform: "capitalize"}}>
                  Delegation Nodes
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <OldValidatorsTable onDelegatory={onDelegatory} />
          </Box>
        </>
      )}
    </Box>
  );
}
