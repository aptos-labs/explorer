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
import {useTranslation, type TFunction} from "../../../i18n";
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

function kindLabel(
  kind: PaymentIdentification["primaryKind"],
  t: TFunction,
): string {
  switch (kind) {
    case "p2p":
      return t("payments.kind.p2p");
    case "controlled":
      return t("payments.kind.controlled");
    case "confidential":
      return t("payments.kind.confidential");
    case "confidential_to_public":
      return t("payments.kind.confidentialToPublic");
    case "public_to_confidential":
      return t("payments.kind.publicToConfidential");
    case "exchange":
      return t("payments.kind.exchange");
    case "fees_only":
      return t("payments.kind.feesOnly");
    default:
      return t("payments.kind.none");
  }
}

function stepTitle(step: PaymentStep, t: TFunction): string {
  switch (step.kind) {
    case "p2p":
      return t("payments.kind.p2pTransfer");
    case "controlled":
      return t("payments.kind.controlledTransfer");
    case "confidential":
      return t("payments.kind.confidential");
    case "confidential_to_public":
      return t("payments.kind.confidentialToPublic");
    case "public_to_confidential":
      return t("payments.kind.publicToConfidential");
    case "exchange":
      return t("payments.kind.exchange");
    default:
      return step.title;
  }
}

function translatePartnerLabel(
  label: string | undefined,
  t: TFunction,
): string | undefined {
  if (!label) return undefined;
  switch (label) {
    case "TransferRef / dispatchable partner":
      return t("payments.partner.transferRef");
    case "partner module":
      return t("payments.partner.module");
    case "intermediary":
      return t("payments.partner.intermediary");
    default:
      return label;
  }
}

function feeCopy(
  fee: PaymentFeeLine,
  t: TFunction,
): {label: string; explanation: string} {
  switch (fee.kind) {
    case "execution":
      return {
        label: t("payments.fee.execution"),
        explanation: t("payments.fee.executionTip"),
      };
    case "io":
      return {
        label: t("payments.fee.io"),
        explanation: t("payments.fee.ioTip"),
      };
    case "storage":
      return {
        label: t("payments.fee.storage"),
        explanation: t("payments.fee.storageTip"),
      };
    case "storage_refund":
      return {
        label: t("payments.fee.storageRefund"),
        explanation: t("payments.fee.storageRefundTip"),
      };
    case "gas":
      return {
        label: t("payments.fee.gas"),
        explanation: t("payments.fee.gasTip"),
      };
    case "net":
      return {
        label: t("payments.fee.net"),
        explanation: fee.explanation,
      };
    case "partner": {
      const symbol = fee.label.replace(
        /^Partner \/ protocol fee \((.+)\)$/,
        "$1",
      );
      return {
        label: t("payments.fee.partner", {symbol}),
        explanation: t("payments.fee.partnerTip"),
      };
    }
    default:
      return {label: fee.label, explanation: fee.explanation};
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
  const {t} = useTranslation();
  if (amount.visibility === "encrypted") {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{alignItems: "center", flexWrap: "wrap"}}
      >
        <LockOutlinedIcon fontSize="small" aria-hidden />
        <Typography component="span" sx={{fontWeight: 700}}>
          {t("payments.amountEncrypted")}
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
  const {t, locale} = useTranslation();
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
            label={t("payments.step", {n: index + 1})}
            sx={{fontWeight: 700}}
          />
          <Chip
            size="small"
            color={kindChipColor(step.kind)}
            label={kindLabel(step.kind, t)}
          />
          <Typography variant="h6" component="h3">
            {stepTitle(step, t)}
          </Typography>
        </Stack>
        <Typography variant="body1">{step.explanation}</Typography>
        <Stack
          direction={{xs: "column", md: "row"}}
          spacing={3}
          sx={{alignItems: {md: "flex-start"}}}
        >
          <Party label={t("payments.from")} address={step.from} />
          <Party label={t("payments.to")} address={step.to} />
          {step.partner && step.partner !== "voluntary auditor" ? (
            <Party
              label={
                translatePartnerLabel(step.partnerLabel, t) ??
                t("payments.partner.default")
              }
              address={step.partner}
            />
          ) : step.partnerLabel ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{color: "text.secondary"}}>
                {t("payments.partner.default")}
              </Typography>
              <Typography variant="body2">
                {translatePartnerLabel(step.partnerLabel, t)}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
        {step.kind === "exchange" ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              {t("payments.exchangeInput")}
            </Typography>
            {step.amount ? (
              <AmountView amount={step.amount} coinData={coinData} />
            ) : null}
            <Typography variant="subtitle2">
              {t("payments.exchangeOutput")}
            </Typography>
            {step.amountOut ? (
              <AmountView amount={step.amountOut} coinData={coinData} />
            ) : null}
          </Stack>
        ) : step.amount ? (
          <Box>
            <Typography variant="subtitle2" sx={{mb: 0.5}}>
              {t("payments.amount")}
            </Typography>
            <AmountView amount={step.amount} coinData={coinData} />
            {step.amount.visibility === "encrypted" ? (
              <Typography variant="body2" sx={{color: "text.secondary", mt: 1}}>
                {t("payments.ciphertextNote", {
                  amount: formatPaymentAmount(step.amount, locale),
                })}
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {step.partnerFee ? (
          <Alert severity="warning">
            {t("payments.partnerFee", {
              amount: formatPaymentAmount(step.partnerFee, locale),
            })}
          </Alert>
        ) : null}
        <Typography
          variant="caption"
          sx={{color: theme.palette.text.secondary}}
        >
          {t("payments.identifiedFromBody")}
        </Typography>
      </Stack>
    </Paper>
  );
}

function FeesPanel({fees}: {fees: PaymentFeeLine[]}) {
  const {t} = useTranslation();
  const net = fees.find((fee) => fee.kind === "net");
  const partner = fees.filter((fee) => fee.kind === "partner");
  const breakdown = fees.filter(
    (fee) => fee.kind !== "net" && fee.kind !== "partner",
  );
  return (
    <Paper
      variant="outlined"
      sx={{p: {xs: 2, sm: 3}}}
      aria-label={t("payments.feesAria")}
    >
      <Stack spacing={2}>
        <Typography variant="h6" component="h3">
          {t("payments.fees")}
        </Typography>
        <Typography variant="body1">{t("payments.feesIntro")}</Typography>
        {net ? (
          <Box>
            <Typography variant="subtitle2">
              {t("payments.netNetworkFee")}
            </Typography>
            <Typography variant="h5" component="p" sx={{fontWeight: 700}}>
              <APTCurrencyValue amount={net.amountOctas} />
            </Typography>
            <Typography variant="body2" sx={{color: "text.secondary"}}>
              {net.explanation}
            </Typography>
            {net.payer ? (
              <Box sx={{mt: 1}}>
                <Party label={t("payments.paidBy")} address={net.payer} />
              </Box>
            ) : null}
          </Box>
        ) : null}
        {breakdown.length > 0 ? (
          <Stack spacing={1.5} aria-label={t("payments.feeBreakdown")}>
            {breakdown.map((fee) => {
              const copy = feeCopy(fee, t);
              return (
                <Box key={fee.id}>
                  <Typography variant="subtitle2">{copy.label}</Typography>
                  <Typography variant="body2">
                    <APTCurrencyValue amount={fee.amountOctas} /> —{" "}
                    {copy.explanation}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        ) : null}
        {partner.map((fee) => {
          const copy = feeCopy(fee, t);
          return (
            <Alert key={fee.id} severity="warning">
              {copy.label}: {copy.explanation}
            </Alert>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function PaymentsTab({
  transaction,
}: PaymentsTabProps): React.JSX.Element {
  const {t, locale} = useTranslation();
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
        locale,
      }),
    [transaction, connectedWallet, indexer, coinData, locale],
  );

  if (transaction.type !== TransactionTypeName.User) {
    return <EmptyTabContent message={t("payments.userOnly")} />;
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
              label={kindLabel(identification.primaryKind, t)}
              sx={{fontWeight: 700}}
            />
            {identification.involvesConnectedWallet ? (
              <Chip color="success" label={t("payments.involvesWallet")} />
            ) : connectedWallet ? (
              <Chip label={t("payments.walletNotParty")} variant="outlined" />
            ) : (
              <Chip
                icon={<LockOutlinedIcon />}
                label={t("payments.connectToHighlight")}
                variant="outlined"
              />
            )}
            {!identification.success ? (
              <Chip color="error" label={t("payments.txnFailed")} />
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
              {t("payments.noneAlert")}
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
              {t("payments.howTitle")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{color: "text.secondary", mb: 1}}>
              {t("payments.howBody")}
            </Typography>
            <Typography variant="body2" sx={{color: "text.secondary"}}>
              {t("payments.howFuture", {
                reason: CLIENT_SIDE_PAYMENT_TRACKER.reason,
              })}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Typography
        variant="caption"
        sx={{display: "block", mt: 2, color: colors.text.secondary}}
      >
        {t("payments.confidentialNote")}
      </Typography>
    </Box>
  );
}
