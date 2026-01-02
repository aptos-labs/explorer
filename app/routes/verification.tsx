import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      {title: "Token & Address Verification | Aptos Explorer"},
      {
        name: "description",
        content:
          "Submit your token or address for verification on Aptos Explorer.",
      },
      {
        property: "og:title",
        content: "Token & Address Verification | Aptos Explorer",
      },
      {
        property: "og:description",
        content:
          "Submit your token or address for verification on Aptos Explorer.",
      },
      {property: "og:url", content: `${BASE_URL}/verification`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: "Token & Address Verification | Aptos Explorer",
      },
      {
        name: "twitter:description",
        content:
          "Submit your token or address for verification on Aptos Explorer.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/verification`}],
  }),
  component: VerificationPage,
});

function VerificationPage() {
  const [formData, setFormData] = React.useState({
    projectName: "",
    tokenAddress: "",
    websiteUrl: "",
    contactEmail: "",
    description: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({...prev, [field]: e.target.value}));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would submit to an API
    alert("Verification request submitted! We will review your submission.");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{mb: 2}}>
        Token & Address Verification
      </Typography>

      <Alert severity="info" sx={{mb: 4}}>
        Submit your project for verification to get a verified badge on Aptos
        Explorer. Verified tokens and addresses help users identify legitimate
        projects.
      </Alert>

      <Grid container spacing={4}>
        <Grid size={{xs: 12, md: 8}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verification Request Form
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}}>
                <Grid container spacing={3}>
                  <Grid size={{xs: 12}}>
                    <TextField
                      fullWidth
                      label="Project Name"
                      value={formData.projectName}
                      onChange={handleChange("projectName")}
                      required
                    />
                  </Grid>
                  <Grid size={{xs: 12}}>
                    <TextField
                      fullWidth
                      label="Token/Contract Address"
                      value={formData.tokenAddress}
                      onChange={handleChange("tokenAddress")}
                      placeholder="0x..."
                      required
                      helperText="The address of your token or smart contract"
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Website URL"
                      value={formData.websiteUrl}
                      onChange={handleChange("websiteUrl")}
                      type="url"
                      placeholder="https://"
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      value={formData.contactEmail}
                      onChange={handleChange("contactEmail")}
                      type="email"
                      required
                    />
                  </Grid>
                  <Grid size={{xs: 12}}>
                    <TextField
                      fullWidth
                      label="Project Description"
                      value={formData.description}
                      onChange={handleChange("description")}
                      multiline
                      rows={4}
                      placeholder="Tell us about your project..."
                    />
                  </Grid>
                  <Grid size={{xs: 12}}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{mt: 2}}
                    >
                      Submit Verification Request
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Typography variant="body2" paragraph>
                To be eligible for verification, your project should:
              </Typography>
              <ul style={{paddingLeft: "1.5rem"}}>
                <li>
                  <Typography variant="body2">
                    Have a working website
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Deployed smart contract(s) on Aptos mainnet
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Active community or user base
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Clear documentation of the project
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Legitimate use case and non-fraudulent activity
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card sx={{mt: 3}}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Process
              </Typography>
              <Typography variant="body2">
                Verification requests are reviewed by our team within 5-7
                business days. We may reach out for additional information if
                needed.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
