import {Box, Typography, Paper, Divider, Link} from "@mui/material";
import * as React from "react";
import PageHeader from "../layout/PageHeader";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Box mb={4}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Box sx={{typography: "body1", color: "text.secondary"}}>
        {children}
      </Box>
    </Box>
  );
}

export default function DocumentationPage() {
  return (
    <Box>
      <PageMetadata
        title="Documentation"
        description="Learn how to use the Aptos Explorer to view transactions, blocks, validators, accounts, and network analytics."
      />
      <PageHeader />
      <Typography variant="h3" component="h1" gutterBottom mb={4}>
        Explorer Documentation
      </Typography>

      <Paper sx={{p: 4, mb: 4}}>
        <Section title="Overview">
          <Typography paragraph>
            The Aptos Explorer allows you to inspect the state and history of the Aptos blockchain. 
            You can search for transactions, accounts, blocks, and view network-wide analytics.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Transactions">
          <Typography paragraph>
            Transactions represent state changes on the blockchain. The Transactions page lists the most recent transactions committed to the network.
          </Typography>
          <Typography paragraph>
            You can view details such as:
          </Typography>
          <ul>
            <li><strong>Status:</strong> Whether the transaction was executed successfully.</li>
            <li><strong>Gas Fee:</strong> The cost to execute the transaction.</li>
            <li><strong>Sender & Receiver:</strong> The accounts involved in the transaction.</li>
            <li><strong>Events:</strong> Events emitted during execution.</li>
          </ul>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Blocks">
          <Typography paragraph>
            Blocks contain a set of transactions. The Blocks page shows the latest blocks produced by validators. 
            Clicking on a block height reveals the transactions included in that block and the validator who proposed it.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Validators">
          <Typography paragraph>
            Validators are responsible for proposing and voting on blocks. The Validators page provides a leaderboard of active validators, 
            showing their voting power (stake), performance, and location.
          </Typography>
          <Typography paragraph>
            You can also view details about staking and rewards distribution.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Accounts">
          <Typography paragraph>
            Every user on the blockchain has an account identified by an address. The Account page shows:
          </Typography>
          <ul>
            <li><strong>APT Balance:</strong> The amount of native tokens held.</li>
            <li><strong>Resources:</strong> Data stored under the account (e.g., coin balances, NFT collections).</li>
            <li><strong>Modules:</strong> Smart contracts published by the account.</li>
            <li><strong>Transactions:</strong> History of transactions sent or received by the account.</li>
          </ul>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Analytics">
          <Typography paragraph>
            The Analytics section provides visual insights into the network's health and usage, including:
          </Typography>
          <ul>
            <li><strong>TPS (Transactions Per Second):</strong> Real-time throughput of the network.</li>
            <li><strong>Active Accounts:</strong> Number of unique accounts interacting with the chain.</li>
            <li><strong>Gas Usage:</strong> Trends in transaction costs.</li>
          </ul>
        </Section>
        
        <Divider sx={{my: 4}} />

        <Section title="Search">
            <Typography paragraph>
                Use the search bar at the top of the explorer to quickly find:
            </Typography>
            <ul>
                <li><strong>Transaction Hashes/Versions:</strong> Look up specific transactions.</li>
                <li><strong>Account Addresses:</strong> View account balances and history.</li>
                <li><strong>Block Heights:</strong> Inspect specific blocks.</li>
                <li><strong>Resources/Modules:</strong> Find specific Move structs or functions.</li>
            </ul>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Additional Resources">
            <Typography paragraph>
                For in-depth developer documentation, tutorials, and API references, please visit:
            </Typography>
            <Typography>
                <Link 
                    href="https://aptos.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{fontSize: '1.1rem'}}
                >
                    aptos.dev
                </Link>
            </Typography>
        </Section>
      </Paper>
    </Box>
  );
}
