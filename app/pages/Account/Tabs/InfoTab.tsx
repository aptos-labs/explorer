import {
  Box,
  Chip,
  CircularProgress,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountKeyType} from "../../../api/hooks/useGetAccountKeyType";
import {useGetObjectRefs} from "../../../api/hooks/useGetObjectRefs";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {tryStandardizeAddress} from "../../../utils";
import {getLearnMoreTooltip} from "../../Transaction/helpers";

type InfoTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
};

function RefChip({label, exists}: {label: string; exists: boolean}) {
  return (
    <Chip
      label={label}
      size="small"
      color={exists ? "success" : "default"}
      variant={exists ? "filled" : "outlined"}
      sx={{fontWeight: 500}}
    />
  );
}

export default function InfoTab({
  address,
  accountData,
  objectData,
}: InfoTabProps) {
  const theme = useTheme();
  const {
    data: objectRefs,
    isLoading: refsLoading,
    error: refsError,
  } = useGetObjectRefs(address, {enabled: !!objectData});

  const {
    data: keyTypeResult,
    isLoading: keyTypeLoading,
    error: keyTypeError,
  } = useGetAccountKeyType(address, accountData?.sequence_number, {
    enabled: !!accountData,
  });

  if (!accountData && !objectData) {
    return <EmptyTabContent />;
  }

  let accountInfo = null;
  if (accountData) {
    const keyRotated =
      tryStandardizeAddress(address) !==
      tryStandardizeAddress(accountData.authentication_key);

    const sequenceNumber = Number.parseInt(accountData.sequence_number, 10);
    const hasSubmittedTransactions =
      Number.isFinite(sequenceNumber) && sequenceNumber > 0;

    let keyTypeValue: React.ReactNode;
    if (!hasSubmittedTransactions) {
      keyTypeValue = (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          No transactions submitted yet
        </Typography>
      );
    } else if (keyTypeLoading) {
      keyTypeValue = (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CircularProgress size={16} />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Inspecting latest transaction...
          </Typography>
        </Box>
      );
    } else if (keyTypeError) {
      keyTypeValue = (
        <Typography
          variant="body2"
          sx={{
            color: "error",
          }}
        >
          Failed to determine key type.{" "}
          <Link
            component="button"
            variant="body2"
            onClick={() => window.location.reload()}
            sx={{verticalAlign: "baseline"}}
          >
            Retry
          </Link>
        </Typography>
      );
    } else if (keyTypeResult?.keyType) {
      const k = keyTypeResult.keyType;
      const headline =
        k.scheme === "Single Key" && k.innerType
          ? `${k.scheme} (${k.innerType})`
          : k.scheme === "MultiKey" || k.scheme === "Multi-Ed25519"
            ? k.signaturesRequired !== undefined && k.totalKeys !== undefined
              ? `${k.scheme} (${k.signaturesRequired}-of-${k.totalKeys})`
              : k.scheme
            : k.scheme;
      const showSubKeys =
        (k.scheme === "MultiKey" || k.scheme === "Multi-Ed25519") &&
        k.subKeys &&
        k.subKeys.length > 0;
      keyTypeValue = (
        <Stack
          spacing={0.75}
          sx={{
            alignItems: "flex-start",
          }}
        >
          <Chip
            label={headline}
            size="small"
            color="primary"
            variant="outlined"
            sx={{fontWeight: 500}}
          />
          {showSubKeys ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{color: theme.palette.text.secondary, mr: 0.5}}
              >
                Sub-keys:
              </Typography>
              {k.subKeys?.map((sub, i) => (
                <Chip
                  // biome-ignore lint/suspicious/noArrayIndexKey: sub-keys are positional and may repeat
                  key={`${sub.type}-${i}`}
                  label={`${i + 1}. ${sub.display}`}
                  size="small"
                  variant="outlined"
                  sx={{fontWeight: 500}}
                />
              ))}
            </Box>
          ) : null}
          {keyTypeResult.transactionVersion ? (
            <Typography
              variant="caption"
              sx={{color: theme.palette.text.secondary}}
            >
              Inferred from transaction version{" "}
              {keyTypeResult.transactionVersion}
            </Typography>
          ) : null}
        </Stack>
      );
    } else {
      keyTypeValue = (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          Unable to determine from latest transaction
        </Typography>
      );
    }

    accountInfo = (
      <Box
        sx={{
          marginBottom: 3,
        }}
      >
        <ContentBox>
          <ContentRow
            title={"Sequence Number:"}
            value={accountData.sequence_number}
            tooltip={getLearnMoreTooltip("sequence_number")}
          />
          {keyRotated ? (
            <ContentRow
              title={"Authentication Key:"}
              value={
                <>
                  {`${accountData.authentication_key} `}
                  <span
                    style={{marginLeft: 8, color: theme.palette.text.secondary}}
                  >
                    (rotated)
                  </span>
                </>
              }
              tooltip={getLearnMoreTooltip("authentication_key")}
            />
          ) : (
            <ContentRow
              title={"Authentication Key:"}
              value={accountData.authentication_key}
              tooltip={getLearnMoreTooltip("authentication_key")}
            />
          )}
          <ContentRow
            title={"Key Type:"}
            value={keyTypeValue}
            tooltip={getLearnMoreTooltip("key_type")}
          />
        </ContentBox>
      </Box>
    );
  }

  let objectInfo = null;
  if (objectData) {
    const objData = objectData.data as {
      owner: string;
      allow_ungated_transfer: boolean;
    };
    objectInfo = (
      <Box
        sx={{
          marginBottom: 3,
        }}
      >
        <ContentBox>
          <ContentRow
            title={"Owner:"}
            value={<HashButton hash={objData.owner} type={HashType.ACCOUNT} />}
            tooltip={getLearnMoreTooltip("owner")}
          />
          <ContentRow
            title={"Transferrable:"}
            value={objData.allow_ungated_transfer ? "Yes" : "No"}
            tooltip={getLearnMoreTooltip("allow_ungated_transfer")}
          />
        </ContentBox>
      </Box>
    );
  }

  let objectRefsInfo = null;
  if (objectData) {
    objectRefsInfo = (
      <Box
        sx={{
          marginBottom: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: theme.palette.text.primary,
          }}
        >
          Object Capabilities
        </Typography>
        <ContentBox>
          {refsLoading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Scanning creation transaction...
              </Typography>
            </Box>
          ) : objectRefs ? (
            <>
              <ContentRow
                title={"Transfer Ref:"}
                value={
                  <RefChip
                    label={objectRefs.hasTransferRef ? "Exists" : "Not Created"}
                    exists={objectRefs.hasTransferRef}
                  />
                }
                tooltip={getLearnMoreTooltip("transfer_ref")}
              />
              <ContentRow
                title={"Delete Ref:"}
                value={
                  <RefChip
                    label={objectRefs.hasDeleteRef ? "Exists" : "Not Created"}
                    exists={objectRefs.hasDeleteRef}
                  />
                }
                tooltip={getLearnMoreTooltip("delete_ref")}
              />
              <ContentRow
                title={"Extend Ref:"}
                value={
                  <RefChip
                    label={objectRefs.hasExtendRef ? "Exists" : "Not Created"}
                    exists={objectRefs.hasExtendRef}
                  />
                }
                tooltip={getLearnMoreTooltip("extend_ref")}
              />
              {objectRefs.creationTransactionVersion !== null && (
                <ContentRow
                  title={"Creation Transaction:"}
                  value={
                    <HashButton
                      hash={String(objectRefs.creationTransactionVersion)}
                      type={HashType.TRANSACTION}
                    />
                  }
                  tooltip={getLearnMoreTooltip("creation_transaction")}
                />
              )}
            </>
          ) : refsError ? (
            <Typography variant="body2" color="error">
              Failed to load object capabilities.{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => window.location.reload()}
                sx={{verticalAlign: "baseline"}}
              >
                Retry
              </Link>
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Unable to determine object capabilities
            </Typography>
          )}
        </ContentBox>
      </Box>
    );
  }

  return (
    <>
      {accountInfo}
      {objectInfo}
      {objectRefsInfo}
    </>
  );
}
