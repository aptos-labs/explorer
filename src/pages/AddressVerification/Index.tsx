import React from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  Link,
  Divider,
} from "@mui/material";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {WalletConnector} from "../../components/WalletConnector";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import VerificationForm from "./Components/VerificationForm";
import {InfoOutlined} from "@mui/icons-material";

export default function AddressVerificationPage() {
  usePageMetadata({
    title: "Address Verification Request",
  });

  const {connected, account} = useWallet();

  return (
    <Container maxWidth="md">
      <Box sx={{py: 4}}>
        <Typography variant="h3" component="h1" gutterBottom>
          Request Address Verification
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
          Submit a verification request to have your address or project verified
          on Aptos Explorer. Verified addresses display trust indicators to help
          users identify legitimate projects.
        </Typography>

        <Alert severity="info" sx={{mb: 3}} icon={<InfoOutlined />}>
          <Typography variant="body2">
            The verification process involves creating a GitHub pull request
            with your project details. Our team will review your submission and
            may request additional information. Processing typically takes 3-7
            business days.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{p: 3, mb: 3}}>
          <Typography variant="h5" gutterBottom>
            Step 1: Connect Your Wallet
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            Connect your wallet to verify address ownership and auto-fill your
            address.
          </Typography>

          <Box sx={{mb: 2}}>
            <WalletConnector />
          </Box>

          {connected && account && (
            <Alert severity="success" sx={{mt: 2}}>
              <Typography variant="body2">
                Connected: <strong>{account.address}</strong>
              </Typography>
            </Alert>
          )}
        </Paper>

        <Divider sx={{my: 3}} />

        <Paper elevation={1} sx={{p: 3}}>
          <Typography variant="h5" gutterBottom>
            Step 2: Project Information
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
            Provide detailed information about your project to help our review
            team understand your verification request.
          </Typography>

          <VerificationForm connectedAddress={account?.address} />
        </Paper>

        <Box sx={{mt: 3, p: 2, borderRadius: 1}}>
          <Typography variant="h6" gutterBottom>
            Verification Guidelines
          </Typography>
          <Typography variant="body2" sx={{mb: 1}}>
            • Provide accurate and complete information about your project
          </Typography>
          <Typography variant="body2" sx={{mb: 1}}>
            • Include official website and social media links
          </Typography>
          <Typography variant="body2" sx={{mb: 1}}>
            • Projects must be legitimate and actively maintained
          </Typography>
          <Typography variant="body2">
            • False or misleading information will result in request denial
          </Typography>

          <Typography variant="body2" sx={{mt: 2}}>
            Questions? Contact us via{" "}
            <Link
              href="https://github.com/aptos-labs/aptos-developer-discussions/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Discussions
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
