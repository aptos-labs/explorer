import {Box, Stack} from "@mui/material";
import type React from "react";
import {
  LearnMoreTooltip,
  LearnMoreTooltipPlaceholder,
} from "../../components/IndividualPageContent/LearnMoreTooltip";
import TableTooltip from "../../components/Table/TableTooltip";
import {
  getVerifiedMessageAndIcon,
  VerifiedType,
  verifiedLevelMessageKey,
} from "../../components/Table/VerifiedCell";
import TooltipTypography from "../../components/TooltipTypography";
import {InlineMarkup, useTranslation} from "../../i18n";

export function getLearnMoreTooltip(
  txnField: string,
): React.JSX.Element | null {
  return <LearnMoreTooltipField field={txnField} />;
}

function LearnMoreTooltipField({field}: {field: string}): React.JSX.Element {
  const {t} = useTranslation();

  switch (field) {
    case "accumulator_root_hash":
      return (
        <LearnMoreTooltip
          text={t("tooltips.accumulatorRootHash")}
          link="https://aptos.dev/en/network/glossary#merkle-accumulator"
        />
      );
    case "amount":
      return <LearnMoreTooltipPlaceholder />;
    case "authentication_key":
      return <LearnMoreTooltip text={t("tooltips.authenticationKey")} />;
    case "key_type":
      return (
        <LearnMoreTooltip
          text={t("tooltips.keyType")}
          link="https://aptos.dev/en/build/sdks/ts-sdk/account#multikey"
        />
      );
    case "block_height":
      return (
        <LearnMoreTooltip
          text={t("tooltips.blockHeight")}
          link="https://aptos.dev/en/network/glossary#blocks"
        />
      );
    case "epoch":
      return (
        <LearnMoreTooltip
          text={t("tooltips.epoch")}
          link="https://aptos.dev/en/network/glossary#epoch"
        />
      );
    case "event_root_hash":
      return (
        <LearnMoreTooltip
          text={t("tooltips.eventRootHash")}
          link="https://aptos.dev/en/network/glossary#event"
          linkToText
        />
      );
    case "expiration_timestamp_secs":
      return (
        <LearnMoreTooltip
          text={t("tooltips.expirationTimestampSecs")}
          link="https://aptos.dev/en/network/glossary#expiration-time"
        />
      );
    case "fee_payer":
      return <LearnMoreTooltip text={t("tooltips.feePayer")} />;
    case "function":
      return <LearnMoreTooltip text={t("tooltips.function")} />;
    case "encrypted_payload":
      return (
        <LearnMoreTooltip
          text={t("tooltips.encryptedPayload")}
          link="https://aptos.dev/build/guides/encrypted-pending-transactions"
        />
      );
    case "arguments":
      return <LearnMoreTooltip text={t("tooltips.arguments")} />;
    case "gas_fee":
      return (
        <LearnMoreTooltip
          text={t("tooltips.gasFee")}
          link="https://aptos.dev/en/network/glossary#gas"
          linkToText
        />
      );
    case "gas_unit_price":
      return (
        <LearnMoreTooltip
          text={t("tooltips.gasUnitPrice")}
          link="https://aptos.dev/en/network/glossary#gas-unit-price"
          linkToText
        />
      );
    case "gas_used":
      return (
        <LearnMoreTooltip
          text={t("tooltips.gasUsed")}
          link="https://aptos.dev/en/network/glossary#gas"
        />
      );
    case "id":
      return <LearnMoreTooltipPlaceholder />;
    case "max_gas_amount":
      return (
        <LearnMoreTooltip
          text={t("tooltips.maxGasAmount")}
          link="https://aptos.dev/en/network/glossary#maximum-gas-amount"
        />
      );
    case "proposer":
      return <LearnMoreTooltipPlaceholder />;
    case "receiver":
      return <LearnMoreTooltipPlaceholder />;
    case "round":
      return (
        <LearnMoreTooltip
          text={t("tooltips.round")}
          link="https://aptos.dev/en/network/glossary#round"
        />
      );
    case "sender":
      return (
        <LearnMoreTooltip
          text={t("tooltips.sender")}
          link="https://aptos.dev/en/network/glossary#sender"
        />
      );
    case "sequence_number":
      return (
        <LearnMoreTooltip
          text={t("tooltips.sequenceNumber")}
          link="https://aptos.dev/en/network/glossary#sequence-number"
        />
      );
    case "replay_protection_nonce":
      return (
        <LearnMoreTooltip
          text={t("tooltips.replayProtectionNonce")}
          link="https://aptos.dev/en/network/glossary#replay-protection-nonce"
        />
      );
    case "signature":
      return <LearnMoreTooltipPlaceholder />;
    case "state_change_hash":
      return <LearnMoreTooltipPlaceholder />;
    case "status":
      return <LearnMoreTooltipPlaceholder />;
    case "timestamp":
      return <LearnMoreTooltip text={t("tooltips.timestamp")} />;
    case "version":
      return (
        <LearnMoreTooltip
          text={t("tooltips.version")}
          link="https://aptos.dev/en/network/glossary/#version"
        />
      );
    case "vm_status":
      return (
        <LearnMoreTooltip
          text={t("tooltips.vmStatus")}
          link="https://aptos.dev/en/network/glossary#move-virtual-machine-mvm"
          linkToText
        />
      );
    case "coin_verification":
      return (
        <TableTooltip title={t("tooltips.transactionTypes")}>
          <Stack spacing={2}>
            <TooltipTypography variant="inherit">
              <InlineMarkup text={t("tooltips.coinVerificationIntro")} />
            </TooltipTypography>
            {Object.values(VerifiedType).map((level) => {
              const {tooltipMessage, icon} = getVerifiedMessageAndIcon(
                level,
                undefined,
                t,
              );

              return (
                <Box
                  key={level}
                  sx={{display: "flex", alignItems: "flex-start", gap: 2}}
                >
                  {icon}
                  <Stack spacing={0.5}>
                    <TooltipTypography
                      variant="subtitle2"
                      sx={{fontWeight: 600}}
                    >
                      {t(verifiedLevelMessageKey(level))}
                    </TooltipTypography>
                    <TooltipTypography variant="body2">
                      {tooltipMessage}
                    </TooltipTypography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </TableTooltip>
      );
    case "transfer_ref":
      return <LearnMoreTooltip text={t("tooltips.transferRef")} />;
    case "delete_ref":
      return <LearnMoreTooltip text={t("tooltips.deleteRef")} />;
    case "extend_ref":
      return <LearnMoreTooltip text={t("tooltips.extendRef")} />;
    case "creation_transaction":
      return <LearnMoreTooltip text={t("tooltips.creationTransaction")} />;
    case "owner":
      return <LearnMoreTooltip text={t("tooltips.owner")} />;
    case "allow_ungated_transfer":
      return <LearnMoreTooltip text={t("tooltips.allowUngatedTransfer")} />;
    default:
      return <LearnMoreTooltipPlaceholder />;
  }
}
