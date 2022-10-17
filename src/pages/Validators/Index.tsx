import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import PageHeader from "../layout/PageHeader";
import {ValidatorsTable} from "./Table";

export default function ValidatorsPage() {
  const {activeValidators} = useGetValidatorSet();
  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <ValidatorsTable validators={activeValidators} />
    </Box>
  );
}
