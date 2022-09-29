import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import PageHeader from "../../components/PageHeader";
import {ValidatorsTable} from "./Table";

export function ValidatorsPage() {
  const {activeValidators} = useGetValidatorSet();
  return (
    <Box>
      <PageHeader />
      <Typography variant="h5" marginBottom={2}>
        Validators
      </Typography>
      <ValidatorsTable validators={activeValidators} />
    </Box>
  );
}
