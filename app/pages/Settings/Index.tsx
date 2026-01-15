import * as React from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";
import {Card} from "../../components/Card";
import {
  defaultFeatureName,
  features,
  FeatureName,
  isValidFeatureName,
} from "../../constants";
import {useFeatureSelector} from "../../global-config";

export default function SettingsPage() {
  const [featureName, setFeatureName] = useFeatureSelector();

  const handleFeatureChange = (event: SelectChangeEvent) => {
    const nextValue = event.target.value;
    if (isValidFeatureName(nextValue)) {
      setFeatureName(nextValue);
    }
  };

  const handleReset = () => {
    setFeatureName(defaultFeatureName);
  };

  const featureOptions = Object.entries(features) as [FeatureName, string][];

  return (
    <>
      <PageMetadata
        title="Settings"
        description="Configure explorer preferences such as feature mode and stored cookie settings."
        type="website"
        keywords={["settings", "features", "preferences", "configuration"]}
        canonicalPath="/settings"
      />
      <Box>
        <PageHeader />
        <Typography variant="h3" marginBottom={2}>
          Settings
        </Typography>
        <Stack spacing={3} sx={{maxWidth: 720}}>
          <Card>
            <Stack spacing={2}>
              <Typography variant="h6">Feature mode</Typography>
              <Typography color="text.secondary" variant="body2">
                Choose which set of explorer features to enable. Your selection
                is stored in a cookie for future visits.
              </Typography>
              {featureName !== defaultFeatureName && (
                <Alert severity="warning">
                  Non-production features may be unstable or incomplete.
                </Alert>
              )}
              <FormControl size="small">
                <InputLabel id="feature-mode-label">Feature mode</InputLabel>
                <Select
                  labelId="feature-mode-label"
                  id="feature-mode-select"
                  value={featureName}
                  label="Feature mode"
                  onChange={handleFeatureChange}
                >
                  {featureOptions.map(([name, label]) => (
                    <MenuItem key={name} value={name}>
                      {name === defaultFeatureName
                        ? `${label} (default)`
                        : label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Reset to production to remove the saved cookie.
                </FormHelperText>
              </FormControl>
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={featureName === defaultFeatureName}
                >
                  Reset to production
                </Button>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
