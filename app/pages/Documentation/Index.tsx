import {Box, Typography, Paper, Divider, Link} from "@mui/material";
import * as React from "react";
import PageHeader from "../layout/PageHeader";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box id={id} mb={4}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Box sx={{typography: "body1", color: "text.secondary"}}>{children}</Box>
    </Box>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb={3} ml={2}>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Box sx={{typography: "body1", color: "text.secondary"}}>{children}</Box>
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
            The Aptos Explorer allows you to inspect the state and history of
            the Aptos blockchain. You can search for transactions, accounts,
            blocks, and view network-wide analytics.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section id="networks" title="Network Selection">
          <Typography paragraph>
            The Aptos blockchain runs on multiple networks. You can switch
            between networks using the network selector dropdown in the top
            navigation bar.
          </Typography>

          <SubSection title="Available Networks">
            <ul>
              <li>
                <strong>Mainnet:</strong> The production network where real
                transactions occur with real value. This is the default network
                and where most users will want to explore.
              </li>
              <li>
                <strong>Testnet:</strong> A testing environment that mirrors
                mainnet functionality but uses test tokens with no real value.
                Ideal for developers testing applications before deploying to
                mainnet.
              </li>
              <li>
                <strong>Devnet:</strong> A development network that resets
                periodically. Used for early-stage development and
                experimentation.
              </li>
              <li>
                <strong>Local:</strong> Connect to a local Aptos node running on
                your machine (http://127.0.0.1:8080). Useful for developers
                running a local development environment.
              </li>
            </ul>
          </SubSection>

          <SubSection title="Network Differences">
            <Typography paragraph>
              Each network is independent with its own:
            </Typography>
            <ul>
              <li>
                <strong>Chain ID:</strong> A unique identifier displayed next to
                each network name in the selector.
              </li>
              <li>
                <strong>State:</strong> Accounts, transactions, and data are
                separate between networks.
              </li>
              <li>
                <strong>Tokens:</strong> APT and other tokens on testnet/devnet
                have no real value.
              </li>
            </ul>
            <Typography paragraph sx={{mt: 2}}>
              <strong>Note:</strong> Some features like Analytics are only
              available on Mainnet where meaningful network-wide metrics exist.
            </Typography>
          </SubSection>

          <SubSection title="Sharing Links">
            <Typography paragraph>
              When you select a network, the URL automatically includes a{" "}
              <code>?network=</code> parameter. This means you can share links
              that will open directly to the correct network. For example, a
              testnet transaction link will automatically switch the viewer to
              testnet.
            </Typography>
          </SubSection>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Transactions">
          <Typography paragraph>
            Transactions represent state changes on the blockchain. The
            Transactions page lists the most recent transactions committed to
            the network.
          </Typography>
          <Typography paragraph>You can view details such as:</Typography>
          <ul>
            <li>
              <strong>Status:</strong> Whether the transaction was executed
              successfully.
            </li>
            <li>
              <strong>Gas Fee:</strong> The cost to execute the transaction.
            </li>
            <li>
              <strong>Sender & Receiver:</strong> The accounts involved in the
              transaction.
            </li>
            <li>
              <strong>Events:</strong> Events emitted during execution.
            </li>
          </ul>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Blocks">
          <Typography paragraph>
            Blocks contain a set of transactions. The Blocks page shows the
            latest blocks produced by validators. Clicking on a block height
            reveals the transactions included in that block and the validator
            who proposed it.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Validators">
          <Typography paragraph>
            Validators are responsible for proposing and voting on blocks. The
            Validators page provides a leaderboard of active validators, showing
            their voting power (stake), performance, and location.
          </Typography>
          <Typography paragraph>
            You can also view details about staking and rewards distribution.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section id="accounts" title="Accounts">
          <Typography paragraph>
            Every user on the blockchain has an account identified by an
            address. The Account page provides comprehensive information about
            any address on the network.
          </Typography>

          <SubSection title="Account Tabs">
            <Typography paragraph>
              When viewing an account, you'll see several tabs of information:
            </Typography>
            <ul>
              <li>
                <strong>Transactions:</strong> Complete history of transactions
                sent or received by the account. You can see the transaction
                type, status, gas used, and timestamp.
              </li>
              <li>
                <strong>Coins:</strong> All fungible tokens held by the account,
                including APT and other coins. Shows balances and token
                metadata.
              </li>
              <li>
                <strong>Tokens (NFTs):</strong> Digital assets and NFTs owned by
                the account, including collection information and token
                properties.
              </li>
              <li>
                <strong>Resources:</strong> Raw Move resources stored under the
                account. This is useful for developers to inspect on-chain data
                structures.
              </li>
              <li>
                <strong>Modules:</strong> Smart contracts (Move modules)
                published by the account. Includes source code viewing and
                function interaction.
              </li>
              <li>
                <strong>Info:</strong> Account metadata including sequence
                number and authentication key.
              </li>
            </ul>
          </SubSection>

          <SubSection title="Finding an Account">
            <Typography paragraph>
              You can navigate to an account page by:
            </Typography>
            <ul>
              <li>
                Entering the account address in the search bar (e.g.,{" "}
                <code>0x1</code>)
              </li>
              <li>
                Using an ANS (Aptos Name Service) name (e.g.,{" "}
                <code>gregnazario.apt</code>)
              </li>
              <li>Clicking on an address link anywhere in the explorer</li>
              <li>
                Connecting your wallet and clicking on your account address
              </li>
            </ul>
          </SubSection>

          <SubSection title="Special Account Types">
            <Typography paragraph>
              The explorer recognizes different account types:
            </Typography>
            <ul>
              <li>
                <strong>Standard Accounts:</strong> Regular user accounts with
                balances and transaction history.
              </li>
              <li>
                <strong>Objects:</strong> On-chain objects that can hold
                resources and be transferred between accounts.
              </li>
              <li>
                <strong>Multisig Accounts:</strong> Accounts requiring multiple
                signatures for transactions. These show a dedicated Multisig tab
                for managing proposals.
              </li>
            </ul>
          </SubSection>
        </Section>

        <Divider sx={{my: 4}} />

        <Section id="modules" title="Interacting with Smart Contracts">
          <Typography paragraph>
            The Explorer allows you to interact directly with Move modules
            (smart contracts) deployed on the Aptos blockchain. You can call
            view functions to read data and execute entry functions to submit
            transactions.
          </Typography>

          <SubSection title="View Functions (Read-Only)">
            <Typography paragraph>
              View functions allow you to query on-chain data without submitting
              a transaction or connecting a wallet. To use view functions:
            </Typography>
            <ol>
              <li>Navigate to an account that has published modules</li>
              <li>Click on the "Modules" tab</li>
              <li>Select "View" to see available view functions</li>
              <li>Choose a module and function from the sidebar</li>
              <li>
                Fill in the required parameters (type arguments and function
                arguments)
              </li>
              <li>Click "Query" to execute and see the results</li>
            </ol>
            <Typography paragraph sx={{mt: 2}}>
              <strong>Tip:</strong> You can optionally specify a "Ledger
              Version" to query historical state at a specific blockchain
              version.
            </Typography>
          </SubSection>

          <SubSection title="Entry Functions (Write)">
            <Typography paragraph>
              Entry functions modify on-chain state and require a connected
              wallet to sign and submit the transaction. To use entry functions:
            </Typography>
            <ol>
              <li>Connect your wallet using the "Connect Wallet" button</li>
              <li>Navigate to an account with published modules</li>
              <li>Click on the "Modules" tab</li>
              <li>Select "Run" to see available entry functions</li>
              <li>Choose a module and function from the sidebar</li>
              <li>
                Fill in the required parameters (the signer field will
                auto-populate with your wallet address)
              </li>
              <li>Click "Execute" to submit the transaction</li>
              <li>Approve the transaction in your wallet</li>
            </ol>
            <Typography paragraph sx={{mt: 2}}>
              After execution, you'll see the transaction result with a link to
              view the full transaction details.
            </Typography>
          </SubSection>

          <SubSection title="Input Format Tips">
            <Typography paragraph>
              When providing function arguments:
            </Typography>
            <ul>
              <li>
                <strong>Addresses:</strong> Use full addresses (
                <code>0x1...</code>) or ANS names (<code>name.apt</code>)
              </li>
              <li>
                <strong>Bytes (vector&lt;u8&gt;):</strong> Use hex format (
                <code>0xDEADBEEF</code>) or array format (
                <code>[222, 173, 190, 239]</code>)
              </li>
              <li>
                <strong>Arrays:</strong> Use JSON format (
                <code>["value1", "value2"]</code>) or comma-separated (
                <code>value1, value2</code>)
              </li>
              <li>
                <strong>Optional values:</strong> Leave the field empty for{" "}
                <code>Option::none</code>
              </li>
              <li>
                <strong>Booleans:</strong> Enter <code>true</code> or{" "}
                <code>false</code>
              </li>
            </ul>
          </SubSection>
        </Section>

        <Divider sx={{my: 4}} />

        <Section id="wallet" title="Connecting a Wallet">
          <Typography paragraph>
            Connecting a wallet allows you to interact with the blockchain
            directly from the Explorer, including executing transactions and
            viewing your personal account.
          </Typography>

          <SubSection title="How to Connect">
            <ol>
              <li>
                Click the "Connect Wallet" button in the top navigation bar
              </li>
              <li>
                A modal will appear showing available wallet options. Petra
                wallet is recommended but other Aptos-compatible wallets are
                also supported.
              </li>
              <li>
                Select your preferred wallet. If you don't have the wallet
                installed, you'll be prompted to install it.
              </li>
              <li>Approve the connection request in your wallet extension</li>
              <li>
                Once connected, you'll see your account address in the
                navigation bar
              </li>
            </ol>
          </SubSection>

          <SubSection title="What You Can Do With a Connected Wallet">
            <ul>
              <li>
                <strong>Execute Transactions:</strong> Call entry functions on
                smart contracts
              </li>
              <li>
                <strong>Stake APT:</strong> Delegate your APT to validators
                directly from the Validators page
              </li>
              <li>
                <strong>View Your Account:</strong> Quickly navigate to your
                account page to see your balances, tokens, and transaction
                history
              </li>
            </ul>
          </SubSection>

          <SubSection title="Network Compatibility">
            <Typography paragraph>
              Make sure your wallet is connected to the same network as the
              Explorer (Mainnet, Testnet, or Devnet). The Explorer will indicate
              which network you're viewing, and your wallet should match this
              network.
            </Typography>
          </SubSection>
        </Section>

        <Divider sx={{my: 4}} />

        <Section id="staking" title="Staking APT">
          <Typography paragraph>
            You can stake your APT tokens directly through the Explorer to earn
            rewards while helping secure the network. Aptos uses delegated
            proof-of-stake, which means you delegate your tokens to validators
            who participate in consensus.
          </Typography>

          <SubSection title="How to Stake">
            <ol>
              <li>Navigate to the Validators page</li>
              <li>Switch to the "Delegations" tab to view delegation pools</li>
              <li>Connect your wallet if not already connected</li>
              <li>
                Browse validators and select one based on their performance,
                commission rate, and total stake
              </li>
              <li>
                Click on a validator to view their details, then click "Stake"
              </li>
              <li>
                Enter the amount of APT you want to stake (minimum 11 APT)
              </li>
              <li>Approve the transaction in your wallet</li>
            </ol>
          </SubSection>

          <SubSection title="Understanding Staking">
            <ul>
              <li>
                <strong>Minimum Stake:</strong> 11 APT is required to stake. A
                small add-stake fee is deducted and returned at the end of the
                epoch.
              </li>
              <li>
                <strong>Rewards:</strong> You start earning rewards at the
                beginning of the next epoch (epochs are approximately 2 hours).
                Rewards are calculated based on your stake amount, the network's
                APR, and the validator's performance, minus the operator's
                commission.
              </li>
              <li>
                <strong>Validator Selection:</strong> Choose validators based on
                their rewards performance, commission rate, and whether they are
                active. Validators need at least 1M APT in their pool to be
                active and earn rewards.
              </li>
            </ul>
          </SubSection>

          <SubSection title="Unstaking and Withdrawing">
            <Typography paragraph>
              Unstaking involves two steps: unstaking and withdrawing.
            </Typography>
            <ul>
              <li>
                <strong>Unstaking:</strong> You can unstake at any time, but
                funds enter a "Withdraw Pending" state until the next unlock
                date (up to 14 days depending on the delegation pool's cycle).
              </li>
              <li>
                <strong>Withdraw Pending:</strong> Your tokens are locked and
                cannot be withdrawn until the unlock date passes.
              </li>
              <li>
                <strong>Withdraw Ready:</strong> Once unlocked, you can withdraw
                your tokens back to your wallet.
              </li>
            </ul>
            <Typography paragraph sx={{mt: 2}}>
              You can check the unlock date and your staking status on the
              individual validator's page.
            </Typography>
          </SubSection>

          <SubSection title="Commission Rates">
            <Typography paragraph>
              Validators may change their commission rates. When a change is
              announced, it takes effect at the end of the current lockup cycle
              (approximately 7.5 days), giving you time to unstake if you
              disagree with the new rate.
            </Typography>
          </SubSection>
        </Section>

        <Divider sx={{my: 4}} />

        <Section id="search" title="Search">
          <Typography paragraph>
            The search bar at the top of the Explorer is a powerful tool for
            finding anything on the Aptos blockchain. It supports multiple input
            types and provides intelligent results.
          </Typography>

          <SubSection title="What You Can Search">
            <ul>
              <li>
                <strong>Account Addresses:</strong> Enter a full address (e.g.,{" "}
                <code>0x1234...abcd</code>) to view the account page. Both
                32-byte and 64-character addresses are supported.
              </li>
              <li>
                <strong>ANS Names:</strong> Search by Aptos Name Service names
                like <code>gregnazario.apt</code> or <code>name.petra</code>{" "}
                (which resolves to <code>.apt</code>).
              </li>
              <li>
                <strong>Transaction Hashes:</strong> Paste a transaction hash to
                view its details, status, and events.
              </li>
              <li>
                <strong>Transaction Versions:</strong> Enter a numeric
                transaction version to look up specific transactions.
              </li>
              <li>
                <strong>Block Heights:</strong> Enter a block number to view the
                block details and included transactions.
              </li>
              <li>
                <strong>Coins and Tokens:</strong> Search by coin name, symbol,
                or full type (e.g., <code>APT</code>, <code>USDC</code>, or{" "}
                <code>0x1::aptos_coin::AptosCoin</code>).
              </li>
              <li>
                <strong>Fungible Assets:</strong> Search by asset address or
                name to find fungible asset details.
              </li>
              <li>
                <strong>Emojicoin:</strong> Search using emoji characters to
                find emojicoin markets.
              </li>
              <li>
                <strong>Known Addresses:</strong> Search by name for well-known
                addresses like "Aptos Framework" or other labeled accounts.
              </li>
            </ul>
          </SubSection>

          <SubSection title="Search Tips">
            <ul>
              <li>
                Search is case-insensitive for names and symbols, but addresses
                must be valid hex format.
              </li>
              <li>
                Results are grouped by type (Accounts, Assets, Transactions,
                Blocks) for easy navigation.
              </li>
              <li>
                For numeric searches, the Explorer will check if it's a valid
                block height, transaction version, or both.
              </li>
              <li>
                If an address doesn't exist on-chain yet, you can still navigate
                to it—useful for viewing addresses before their first
                transaction.
              </li>
            </ul>
          </SubSection>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Analytics">
          <Typography paragraph>
            The Analytics section provides visual insights into the network's
            health and usage, including:
          </Typography>
          <ul>
            <li>
              <strong>TPS (Transactions Per Second):</strong> Real-time
              throughput of the network.
            </li>
            <li>
              <strong>Active Accounts:</strong> Number of unique accounts
              interacting with the chain.
            </li>
            <li>
              <strong>Gas Usage:</strong> Trends in transaction costs.
            </li>
            <li>
              <strong>New Accounts:</strong> Daily new accounts created on the
              network.
            </li>
            <li>
              <strong>Contract Deployments:</strong> Smart contract deployment
              trends.
            </li>
          </ul>
          <Typography paragraph sx={{mt: 2}}>
            Analytics are available on Mainnet to provide meaningful
            network-wide metrics.
          </Typography>
        </Section>

        <Divider sx={{my: 4}} />

        <Section title="Additional Resources">
          <Typography paragraph>
            For in-depth developer documentation, tutorials, and API references,
            please visit:
          </Typography>
          <Typography>
            <Link
              href="https://aptos.dev"
              target="_blank"
              rel="noopener noreferrer"
              sx={{fontSize: "1.1rem"}}
            >
              aptos.dev
            </Link>
          </Typography>
        </Section>
      </Paper>
    </Box>
  );
}
