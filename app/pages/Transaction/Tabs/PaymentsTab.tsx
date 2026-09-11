import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useMemo} from "react";
import type * as React from "react";
import type {Types} from "~/types/aptos";
import {
  type CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import HashButton, {HashType} from "../../../components/HashButton";
import {TransactionTypeName} from "../../../components/TransactionType";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import {addressFromWallet} from "../../../utils";
import {CLIENT_SIDE_PAYMENT_TRACKER} from "../payments/clientTrace";
import {
  formatPaymentAmount,
  identifyPayments,
} from "../payments/identifyPayments";
import {paymentLegCount, shouldRenderPaymentMermaid} from "../payments/mermaid";
import type {
  PaymentAmount,
  PaymentFeeLine,
  PaymentIdentification,
  PaymentKind,
  PaymentStep,
} from "../payments/types";
import {useTransactionBalanceChanges} from "../utils";
import {
  FungibleAssetAmount,
  FungibleAssetChip,
} from "./Components/FungibleAssetDisplay";
import PaymentFlowDiagram from "./Components/PaymentFlowDiagram";

type PaymentsTabProps = {
  transaction: Types.Transaction;
};

function kindChipColor(
  kind: PaymentKind | PaymentIdentification["primaryKind"],
): "default" | "primary" | "secondary" | "success" | "warning" | "info" {
  switch (kind) {
    case "p2p":
      return "info";
    case "controlled":
      return "warning";
    case "confidential":
    case "confidential_to_public":
    case "public_to_confidential":
      return "primary";
    case "exchange":
      return "success";
    case "fees_only":
      return "default";
    default:
      return "default";
  }
}

function kindLabel(kind: PaymentIdentification["primaryKind"]): string {
  switch (kind) {
    case "p2p":
      return "Peer-to-peer";
    case "controlled":
      return "Controlled (partner)";
    case "confidential":
      return "Confidential";
    case "confidential_to_public":
      return "Confidential → public";
    case "public_to_confidential":
      return "Public → confidential";
    case "exchange":
      return "Exchange";
    case "fees_only":
      return "Fees only";
    default:
      return "No payment";
  }
}

type CoinList = {data: CoinDescription[]} | undefined;

function AmountView({
  amount,
  coinData,
}: {
  amount: PaymentAmount;
  coinData: CoinList;
}) {
  if (amount.visibility === "encrypted") {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{alignItems: "center", flexWrap: "wrap"}}
      >
        <LockOutlinedIcon fontSize="small" aria-hidden />
        <Typography component="span" sx={{fontWeight: 700}}>
          Amount encrypted
        </Typography>
        <FungibleAssetChip metadata={amount.assetId} coinData={coinData} />
      </Stack>
    );
  }
  if (!amount.raw) {
    return <FungibleAssetChip metadata={amount.assetId} coinData={coinData} />;
  }
  if (amount.symbol === "APT") {
    return (
      <Typography component="span" sx={{fontWeight: 700}}>
        <APTCurrencyValue amount={amount.raw} />
      </Typography>
    );
  }
  return (
    <FungibleAssetAmount
      metadata={amount.assetId}
      amount={amount.raw}
      coinData={coinData}
    />
  );
}

function Party({label, address}: {label: string; address?: string}) {
  if (!address) return null;
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{color: "text.secondary"}}>
        {label}
      </Typography>
      <HashButton hash={address} type={HashType.ACCOUNT} size="small" />
    </Stack>
  );
}

function StepCard({
  step,
  coinData,
  index,
}: {
  step: PaymentStep;
  coinData: CoinList;
  index: number;
}) {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{p: {xs: 2, sm: 3}, borderLeft: 6, borderLeftColor: "primary.main"}}
      data-payment-kind={step.kind}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          sx={{alignItems: "center", flexWrap: "wrap"}}
        >
          <Chip
            size="small"
            label={`Step ${index + 1}`}
            sx={{fontWeight: 700}}
          />
          <Chip
            size="small"
            color={kindChipColor(step.kind)}
            label={kindLabel(step.kind)}
          />
          <Typography variant="h6" component="h3">
            {step.title}
          </Typography>
        </Stack>
        <Typography variant="body1">{step.explanation}</Typography>
        <Stack
          direction={{xs: "column", md: "row"}}
          spacing={3}
          sx={{alignItems: {md: "flex-start"}}}
        >
          <Party label="From" address={step.from} />
          <Party label="To" address={step.to} />
          {step.partner && step.partner !== "voluntary auditor" ? (
            <Party
              label={step.partnerLabel ?? "Partner"}
              address={step.partner}
            />
          ) : step.partnerLabel ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{color: "text.secondary"}}>
                Partner
              </Typography>
              <Typography variant="body2">{step.partnerLabel}</Typography>
            </Stack>
          ) : null}
        </Stack>
        {step.kind === "exchange" ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Exchange input</Typography>
            {step.amount ? (
              <AmountView amount={step.amount} coinData={coinData} />
            ) : null}
            <Typography variant="subtitle2">Exchange output</Typography>
            {step.amountOut ? (
              <AmountView amount={step.amountOut} coinData={coinData} />
            ) : null}
          </Stack>
        ) : step.amount ? (
          <Box>
            <Typography variant="subtitle2" sx={{mb: 0.5}}>
              Amount
            </Typography>
            <AmountView amount={step.amount} coinData={coinData} />
            {step.amount.visibility === "encrypted" ? (
              <Typography variant="body2" sx={{color: "text.secondary", mt: 1}}>
                {formatPaymentAmount(step.amount)} — ciphertext is not decrypted
                in the explorer.
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {step.partnerFee ? (
          <Alert severity="warning">
            Partner / protocol fee: {formatPaymentAmount(step.partnerFee)}
          </Alert>
        ) : null}
        <Typography
          variant="caption"
          sx={{color: theme.palette.text.secondary}}
        >
          Identified from this transaction body (events, payload, write-set). No
          extra API calls.
        </Typography>
      </Stack>
    </Paper>
  );
}

function FeesPanel({fees}: {fees: PaymentFeeLine[]}) {
  const net = fees.find((fee) => fee.kind === "net");
  const partner = fees.filter((fee) => fee.kind === "partner");
  const breakdown = fees.filter(
    (fee) => fee.kind !== "net" && fee.kind !== "partner",
  );
  return (
    <Paper
      variant="outlined"
      sx={{p: {xs: 2, sm: 3}}}
      aria-label="Payment fees"
    >
      <Stack spacing={2}>
        <Typography variant="h6" component="h3">
          Fees
        </Typography>
        <Typography variant="body1">
          Every user transaction pays network fees in APT. Storage refunds
          reduce the net cost. Partner or protocol skims (if any) are listed
          separately from gas.
        </Typography>
        {net ? (
          <Box>
            <Typography variant="subtitle2">Net network fee</Typography>
            <Typography variant="h5" component="p" sx={{fontWeight: 700}}>
              <APTCurrencyValue amount={net.amountOctas} />
            </Typography>
            <Typography variant="body2" sx={{color: "text.secondary"}}>
              {net.explanation}
            </Typography>
            {net.payer ? (
              <Box sx={{mt: 1}}>
                <Party label="Paid by" address={net.payer} />
              </Box>
            ) : null}
          </Box>
        ) : null}
        {breakdown.length > 0 ? (
          <Stack spacing={1.5} aria-label="Fee breakdown">
            {breakdown.map((fee) => (
              <Box key={fee.id}>
                <Typography variant="subtitle2">{fee.label}</Typography>
                <Typography variant="body2">
                  <APTCurrencyValue amount={fee.amountOctas} /> —{" "}
                  {fee.explanation}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
        {partner.map((fee) => (
          <Alert key={fee.id} severity="warning">
            {fee.label}: {fee.explanation}
          </Alert>
        ))}
      </Stack>
    </Paper>
  );
}

export default function PaymentsTab({
  transaction,
}: PaymentsTabProps): React.JSX.Element {
  const theme = useTheme();
  const colors = getSemanticColors(theme.palette.mode);
  const {account} = useWallet();
  const connectedWallet = addressFromWallet(account?.address);
  const {data: coinData} = useGetCoinList();
  const {data: indexer} = useTransactionBalanceChanges(
    "version" in transaction ? transaction.version : transaction.hash,
  );

  const identification = useMemo(
    () =>
      identifyPayments({
        transaction,
        connectedWallet: connectedWallet || undefined,
        indexerActivities: indexer?.fungible_asset_activities,
        coinData: coinData?.data,
      }),
    [transaction, connectedWallet, indexer, coinData],
  );

  if (transaction.type !== TransactionTypeName.User) {
    return (
      <EmptyTabContent message="Payments are identified for user transactions." />
    );
  }

  const showMermaid = shouldRenderPaymentMermaid(
    identification.steps.length,
    paymentLegCount(identification.flow),
  );

  return (
    <Box sx={{marginBottom: 3}} data-entity-type="payments">
      <ContentBox>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} sx={{alignItems: "center"}}>
            <PaymentsOutlinedIcon color="primary" />
            <Typography variant="h5" component="h2">
              {identification.headline}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{alignItems: "center", flexWrap: "wrap"}}
          >
            <Chip
              color={kindChipColor(identification.primaryKind)}
              label={kindLabel(identification.primaryKind)}
              sx={{fontWeight: 700}}
            />
            {identification.involvesConnectedWallet ? (
              <Chip color="success" label="Involves your connected wallet" />
            ) : connectedWallet ? (
              <Chip label="Your wallet is not a party" variant="outlined" />
            ) : (
              <Chip
                icon={<LockOutlinedIcon />}
                label="Connect a wallet to highlight your payments"
                variant="outlined"
              />
            )}
            {!identification.success ? (
              <Chip color="error" label="Transaction failed" />
            ) : null}
          </Stack>
          <Typography
            variant="body1"
            sx={{fontSize: {xs: "1rem", sm: "1.05rem"}}}
          >
            {identification.explanation}
          </Typography>
          {identification.primaryKind === "none" ? (
            <Alert severity="info" icon={<InfoOutlinedIcon />}>
              Nothing here looks like a payment. Check Events and Balance Change
              for raw activity.
            </Alert>
          ) : null}
        </Stack>
      </ContentBox>

      <Box sx={{mt: 3}}>
        <FeesPanel fees={identification.fees} />
      </Box>

      {showMermaid ? (
        <ContentBox>
          <PaymentFlowDiagram flow={identification.flow} />
        </ContentBox>
      ) : null}

      {identification.steps.length > 0 ? (
        <Stack spacing={2} sx={{mt: 3}}>
          {identification.steps.map((step, i) => (
            <StepCard key={step.id} step={step} coinData={coinData} index={i} />
          ))}
        </Stack>
      ) : null}

      <Box sx={{mt: 3}}>
        <Accordion
          disableGutters
          elevation={0}
          sx={{border: 1, borderColor: "divider"}}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" sx={{fontWeight: 600}}>
              How payments are identified
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{color: "text.secondary", mb: 1}}>
              This tab reads the transaction payload, events, write-set, and the
              indexer fungible-asset activities already used by Balance Change.
              It does not walk nested Move calls, so it does not issue extra
              REST or view requests.
            </Typography>
            <Typography variant="body2" sx={{color: "text.secondary"}}>
              A future client-side call-graph tracker could reconstruct deeper
              hops in the browser. That path is disabled (
              {CLIENT_SIDE_PAYMENT_TRACKER.reason}).
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Typography
        variant="caption"
        sx={{display: "block", mt: 2, color: colors.text.secondary}}
      >
        Confidential transfer amounts stay encrypted unless they were deposited
        or withdrawn as plaintext. Connecting a wallet highlights whether you
        are a party; it does not decrypt ciphertexts.
      </Typography>
    </Box>
  );
}
