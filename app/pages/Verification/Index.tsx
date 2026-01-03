import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

export default function VerificationPage() {
  return (
    <>
      <PageMetadata
        title="Token & Address Verification"
        description="Learn how to verify tokens and addresses on Aptos Explorer. Get your project verified through the Panora token list. Protect users from scams with official verification."
        type="article"
        keywords={[
          "verification",
          "token verification",
          "address verification",
          "Panora",
          "scam protection",
          "trusted",
        ]}
        canonicalPath="/verification"
      />
      <Box maxWidth="lg" mx="auto" px={3}>
        <Typography variant="h3" component="h1" mb={4}>
          Token & Address Verification Instructions
        </Typography>

        <Alert severity="info" sx={{mb: 4}}>
          <AlertTitle>Verification Overview</AlertTitle>
          The Aptos Explorer supports multiple verification levels to help users
          identify legitimate tokens and addresses. This page explains how to
          get your tokens and addresses verified through the official channels.
        </Alert>

        <Paper sx={{p: 4, mb: 4}}>
          <Typography variant="h4" component="h2" mb={3}>
            Token Verification
          </Typography>

          <Alert severity="warning" sx={{mb: 3}}>
            <AlertTitle>Important Notice</AlertTitle>
            Token verification requests are handled through the{" "}
            <Link
              href="https://github.com/PanoraExchange/Aptos-Tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              Panora token list
            </Link>{" "}
            repository, not through this explorer directly.
          </Alert>

          <Typography variant="body1" mb={2}>
            To get your token verified on Aptos Explorer, you must be added to
            the community-maintained Panora token list.
          </Typography>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            1. Community Verification (Panora Token List)
          </Typography>
          <Typography variant="body1" mb={2}>
            Submit your token to the Panora community token list:
          </Typography>
          <Box sx={{pl: 2, mb: 2}}>
            <Link
              href="https://github.com/PanoraExchange/Aptos-Tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://github.com/PanoraExchange/Aptos-Tokens
            </Link>
          </Box>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            2. Labs Verification (Manual Process)
          </Typography>
          <Typography variant="body1" mb={2}>
            For special cases, tokens can be manually verified by the Aptos Labs
            team. This process is reserved for:
          </Typography>
          <Box component="ul" sx={{pl: 3, mb: 2}}>
            <li>Native tokens (like APT)</li>
            <li>Major stablecoins and established tokens</li>
            <li>Verified Emojicoins (automatically verified)</li>
            <li>Tokens with special significance to the Aptos ecosystem</li>
          </Box>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            3. Verification Levels
          </Typography>
          <Box component="ul" sx={{pl: 3, mb: 2}}>
            <li>
              <strong>Native Token:</strong> Blue verified badge - Native Aptos
              tokens
            </li>
            <li>
              <strong>Labs Verified:</strong> Blue verified badge - Manually
              verified by Aptos Labs
            </li>
            <li>
              <strong>Community Verified:</strong> Blue outlined badge -
              Verified by Panora community
            </li>
            <li>
              <strong>Recognized:</strong> Yellow warning badge - In Panora list
              but not verified
            </li>
            <li>
              <strong>Unverified:</strong> Orange warning badge - Not in any
              verification list
            </li>
          </Box>
        </Paper>

        <Paper sx={{p: 4, mb: 4}}>
          <Typography variant="h4" component="h2" mb={3}>
            Address Verification
          </Typography>
          <Typography variant="body1" mb={2}>
            Address verification helps users identify legitimate project
            addresses and avoid scams. Address verification requests are handled
            directly through the explorer's GitHub repository.
          </Typography>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            1. Submission Process
          </Typography>
          <Typography variant="body1" mb={2}>
            Create a verification request using the GitHub issue template:
          </Typography>
          <Box sx={{pl: 2, mb: 2}}>
            <Link
              href="https://github.com/aptos-labs/explorer/issues/new?assignees=&labels=&projects=&template=verification_request.md&title=%5Bverification%5D+%3CTitle%3E"
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit Address Verification Request
            </Link>
          </Box>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            2. Required Information
          </Typography>
          <Box component="ul" sx={{pl: 3, mb: 2}}>
            <li>
              Full address to be verified (e.g.,
              0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b)
            </li>
            <li>
              Name to display (under 64 characters, may be truncated over 20
              characters)
            </li>
            <li>
              Verification documentation (source code, official documentation,
              etc.)
            </li>
          </Box>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            3. Eligible Addresses
          </Typography>
          <Box component="ul" sx={{pl: 3, mb: 2}}>
            <li>Official project treasury addresses</li>
            <li>Verified smart contract addresses</li>
            <li>Known validator addresses</li>
            <li>Official bridge or protocol addresses</li>
            <li>Major exchange addresses</li>
            <li>DeFi protocol addresses</li>
          </Box>

          <Typography variant="h6" component="h3" mt={3} mb={2}>
            4. Verification Documentation
          </Typography>
          <Typography variant="body1" mb={2}>
            Provide comprehensive documentation to verify the address:
          </Typography>
          <Box component="ul" sx={{pl: 3, mb: 2}}>
            <li>Official documentation linking to the address</li>
            <li>Verified social media announcements</li>
            <li>Smart contract source code (if applicable)</li>
            <li>Audit reports (highly recommended)</li>
            <li>Any other proof of legitimacy</li>
          </Box>
        </Paper>

        <Paper sx={{p: 4}}>
          <Typography variant="h4" component="h2" mb={3}>
            Important Security Information
          </Typography>

          <Alert severity="error" sx={{mb: 3}}>
            <AlertTitle>Security Warning</AlertTitle>
            Never share private keys, seed phrases, or pay fees during the
            verification process. All verification processes are free and
            handled through official GitHub repositories.
          </Alert>

          <Typography variant="h6" component="h3" mt={2} mb={2}>
            Network Availability
          </Typography>
          <Typography variant="body1" mb={2}>
            Verification badges are only displayed on Mainnet. Other networks
            (testnet, devnet) show "No Verification" status.
          </Typography>

          <Typography variant="h6" component="h3" mt={2} mb={2}>
            Banned Assets
          </Typography>
          <Typography variant="body1" mb={2}>
            Assets can be marked as banned if they are identified as scams or
            dangerous. Banned assets display red warning badges.
          </Typography>

          <Typography variant="h6" component="h3" mt={2} mb={2}>
            Processing Time
          </Typography>
          <Typography variant="body1" mb={2}>
            Address verification requests are typically reviewed within 1-2
            weeks. Token verification through Panora follows their community
            review process.
          </Typography>

          <Typography variant="h6" component="h3" mt={2} mb={2}>
            Support
          </Typography>
          <Typography variant="body1" mb={2}>
            For questions about verification:
          </Typography>
          <Box component="ul" sx={{pl: 3}}>
            <li>
              <strong>Address Verification:</strong>{" "}
              <Link
                href="https://github.com/aptos-labs/explorer/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explorer GitHub Issues
              </Link>
            </li>
            <li>
              <strong>Token Verification:</strong>{" "}
              <Link
                href="https://github.com/PanoraExchange/Aptos-Tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                Panora Token List
              </Link>
            </li>
            <li>
              <strong>General Support:</strong>{" "}
              <Link
                href="https://discord.gg/aptoslabs"
                target="_blank"
                rel="noopener noreferrer"
              >
                Aptos Discord
              </Link>
            </li>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
