import React, {useState} from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {useForm, Controller} from "react-hook-form";
import {GitHub, Launch} from "@mui/icons-material";

interface VerificationFormData {
  addressToVerify: string;
  projectName: string;
  websiteUrl: string;
  twitterUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  logoUrl?: string;
  category: string;
  reasoning: string;
  additionalInfo?: string;
}

interface VerificationFormProps {
  connectedAddress?: string;
}

const VERIFICATION_CATEGORIES = [
  "DeFi Protocol",
  "NFT Project",
  "Gaming Project",
  "Infrastructure",
  "Exchange/DEX",
  "Wallet",
  "Developer Tool",
  "DAO/Community",
  "Other",
];

const steps = [
  "Basic Information",
  "Contact & Social Links",
  "Review & Submit",
];

export default function VerificationForm({
  connectedAddress,
}: VerificationFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [generatedPRContent, setGeneratedPRContent] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<VerificationFormData>({
    defaultValues: {
      addressToVerify: connectedAddress || "",
      projectName: "",
      websiteUrl: "",
      twitterUrl: "",
      discordUrl: "",
      telegramUrl: "",
      logoUrl: "",
      category: "",
      reasoning: "",
      additionalInfo: "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const generatePRContent = (data: VerificationFormData) => {
    const socialLinks = [
      data.twitterUrl && `- Twitter: ${data.twitterUrl}`,
      data.discordUrl && `- Discord: ${data.discordUrl}`,
      data.telegramUrl && `- Telegram: ${data.telegramUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    return `# Address Verification Request

## Project Information
- **Address to Verify**: \`${data.addressToVerify}\`
- **Project Name**: ${data.projectName}
- **Category**: ${data.category}
- **Website**: ${data.websiteUrl}
${data.logoUrl ? `- **Logo**: ${data.logoUrl}` : ""}

## Social Media Links
${socialLinks || "No social media links provided"}

## Verification Reasoning
${data.reasoning}

${data.additionalInfo ? `## Additional Information\n${data.additionalInfo}` : ""}

## Verification Checklist
- [ ] Address ownership verified through wallet connection
- [ ] Project website is accessible and legitimate
- [ ] Social media accounts match the project
- [ ] Project description is accurate and detailed
- [ ] No evidence of scam or malicious activity

---
*This verification request was submitted through the Aptos Explorer verification portal.*`;
  };

  const handleFormSubmit = (data: VerificationFormData) => {
    const prContent = generatePRContent(data);
    setGeneratedPRContent(prContent);
    setSubmitDialogOpen(true);
  };

  const handleGitHubSubmission = () => {
    const githubUrl = `https://github.com/aptos-labs/aptos-core/issues/new?title=Address%20Verification%20Request:%20${encodeURIComponent(watchedValues.projectName)}&body=${encodeURIComponent(generatedPRContent)}&labels=verification-request`;
    window.open(githubUrl, "_blank");
    setSubmitDialogOpen(false);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
              <Controller
                name="addressToVerify"
                control={control}
                rules={{
                  required: "Address is required",
                  pattern: {
                    value: /^0x[a-fA-F0-9]{64}$/,
                    message:
                      "Invalid address format (must be 0x followed by 64 hex characters)",
                  },
                }}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Address to Verify"
                    fullWidth
                    error={!!errors.addressToVerify}
                    helperText={
                      errors.addressToVerify?.message ||
                      "The Aptos address you want to verify"
                    }
                    placeholder="0x..."
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <Controller
                name="projectName"
                control={control}
                rules={{required: "Project name is required"}}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Project Name (will appear on verified badge)"
                    fullWidth
                    error={!!errors.projectName}
                    helperText={errors.projectName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <Controller
                name="category"
                control={control}
                rules={{required: "Category is required"}}
                render={({field}) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Project Category</InputLabel>
                    <Select {...field} label="Project Category">
                      {VERIFICATION_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <Controller
                name="reasoning"
                control={control}
                rules={{
                  required: "Verification reasoning is required",
                  minLength: {
                    value: 10,
                    message: "Reasoning must be at least 10 characters",
                  },
                }}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Why should this address be verified?"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.reasoning}
                    helperText={
                      errors.reasoning?.message ||
                      "Explain why this address deserves verification"
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
              <Controller
                name="websiteUrl"
                control={control}
                rules={{
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Must be a valid URL starting with https://",
                  },
                }}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Official Website"
                    fullWidth
                    error={!!errors.websiteUrl}
                    helperText={errors.websiteUrl?.message}
                    placeholder="https://yourproject.com"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="twitterUrl"
                control={control}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="X URL (Optional)"
                    fullWidth
                    placeholder="https://x.com/yourproject"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="discordUrl"
                control={control}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Discord URL (Optional)"
                    fullWidth
                    placeholder="https://discord.gg/yourproject"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="telegramUrl"
                control={control}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Telegram URL (Optional)"
                    fullWidth
                    placeholder="https://t.me/yourproject"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="logoUrl"
                control={control}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Logo URL (Optional)"
                    fullWidth
                    placeholder="https://yourproject.com/logo.png"
                    helperText="Direct link to your project logo"
                  />
                )}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <Controller
                name="additionalInfo"
                control={control}
                render={({field}) => (
                  <TextField
                    {...field}
                    label="Additional Information (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    helperText="Any additional context that might help with verification"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>

            <Box sx={{mb: 2}}>
              <Typography variant="subtitle1" color="primary">
                Address to Verify:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {watchedValues.addressToVerify}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="subtitle2">Project Name:</Typography>
                <Typography variant="body2">
                  {watchedValues.projectName}
                </Typography>
              </Grid>
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="subtitle2">Category:</Typography>
                <Chip label={watchedValues.category} size="small" />
              </Grid>
              <Grid size={{xs: 12}}>
                <Typography variant="subtitle2">Website:</Typography>
                <Link
                  href={watchedValues.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {watchedValues.websiteUrl}
                </Link>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{mt: 2}}>
              <Typography variant="body2">
                Please review all information carefully. Once submitted, you'll
                be directed to GitHub to create a verification request issue.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return (
          watchedValues.addressToVerify &&
          watchedValues.projectName &&
          watchedValues.category &&
          watchedValues.reasoning &&
          !errors.addressToVerify &&
          !errors.projectName &&
          !errors.reasoning
        );
      case 1:
        return (
          !errors.websiteUrl &&
          !errors.discordUrl &&
          !errors.twitterUrl &&
          !errors.telegramUrl
        );
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{mb: 4}}>
        {steps.map((label, index) => (
          <Step key={label} completed={isStepComplete(index) ? true : false}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {renderStepContent()}

        <Box sx={{display: "flex", justifyContent: "space-between", mt: 3}}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>

          <Button
            variant="contained"
            onClick={
              activeStep === steps.length - 1
                ? handleSubmit(handleFormSubmit)
                : handleNext
            }
            disabled={!isStepComplete(activeStep)}
            startIcon={activeStep === steps.length - 1 ? <GitHub /> : undefined}
          >
            {activeStep === steps.length - 1 ? "Create GitHub Issue" : "Next"}
          </Button>
        </Box>
      </form>

      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <GitHub />
            Create GitHub Verification Request
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            Your verification request is ready! Click the button below to create
            a GitHub issue with your project information. Our team will review
            your request and may contact you for additional details.
          </DialogContentText>

          <Typography variant="subtitle2" gutterBottom>
            Preview of your submission:
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              maxHeight: 300,
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {generatedPRContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGitHubSubmission}
            variant="contained"
            startIcon={<Launch />}
          >
            Open GitHub Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
