import React, {useEffect, useState} from "react";
import {Button, Grid, Typography} from "@mui/material";
import HeadingSub from "../../components/HeadingSub";
import {EvaluationSummary} from "aptos-node-checker-client";
import useUrlInput from "./hooks/useUrlInput";
import usePortInput from "./hooks/usePortInput";
import EvaluationDisplay from "./EvaluationDisplay";
import {checkNode, determineNhcUrl} from "./Client";
import ConfigurationSelect from "./ConfigurationSelect";
import {useGlobalState} from "../../GlobalState";
import ErrorSnackbar from "./ErrorSnackbar";

export function NodeCheckerPage() {
  const [state, _dispatch] = useGlobalState();

  const [checking, updateChecking] = useState<boolean>(false);
  const [evaluationSummary, updateEvaluationSummary] = useState<
    EvaluationSummary | undefined
  >(undefined);
  const [baselineConfigurationKey, updateBaselineConfigurationKey] = useState<
    string | undefined
  >(undefined);
  const [errorMessage, updateErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const {
    url,
    clearUrl: _clearUrl,
    renderUrlTextField,
    validateUrlInput,
  } = useUrlInput();
  const {
    port: apiPort,
    clearPort: _clearApiPort,
    renderPortTextField: renderApiPortTextField,
    validatePortInput: validateApiPortInput,
  } = usePortInput();

  const nhcUrl = determineNhcUrl(state);

  const onCheckNodeButtonClick = async () => {
    if (checking) {
      return;
    }
    const urlIsValid = validateUrlInput();
    const apiPortIsValid = validateApiPortInput();
    if (
      !urlIsValid ||
      !apiPortIsValid ||
      baselineConfigurationKey === undefined
    ) {
      return;
    }
    updateChecking(true);
    try {
      const evaluationSummary = await checkNode({
        nhcUrl: nhcUrl,
        nodeUrl: url,
        baselineConfigurationName: baselineConfigurationKey,
        // TODO: Somehow make apiPort a number to begin with.
        apiPort: parseInt(apiPort),
      });
      updateEvaluationSummary(evaluationSummary);
      updateErrorMessage(undefined);
    } catch (e) {
      updateErrorMessage(`Failed to check node: ${e}`);
    }
    updateChecking(false);
  };

  useEffect(() => {
    // Clear the results if the user changes the network.
    updateEvaluationSummary(undefined);
    updateErrorMessage(undefined);
  }, [state.network_name]);

  const checkNodeButton = (
    <span>
      <Button
        fullWidth
        variant="primary"
        onClick={onCheckNodeButtonClick}
        disabled={checking}
      >
        {checking ? "Checking node, please wait..." : "Check Node"}
      </Button>
    </span>
  );

  let evaluationDisplay = null;
  if (evaluationSummary !== undefined) {
    evaluationDisplay = (
      <EvaluationDisplay evaluationSummary={evaluationSummary!} />
    );
  }

  return (
    <Grid container spacing={3}>
      <ErrorSnackbar
        errorMessage={errorMessage}
        updateErrorMessage={updateErrorMessage}
      />
      <Grid item xs={12}>
        <HeadingSub>BETA</HeadingSub>
        <Typography variant="h1" component="h1" gutterBottom>
          Node Health Checker
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            {renderUrlTextField("Node URL")}
          </Grid>
          <Grid item xs={2}>
            {renderApiPortTextField("API Port")}
          </Grid>
          <Grid item xs={4}>
            <ConfigurationSelect
              baselineConfigurationKey={baselineConfigurationKey}
              updateBaselineConfigurationKey={updateBaselineConfigurationKey}
              updateErrorMessage={updateErrorMessage}
            />
          </Grid>
          <Grid item xs={12}>
            {checkNodeButton}
          </Grid>
          {evaluationDisplay}
        </Grid>
      </Grid>
    </Grid>
  );
}
