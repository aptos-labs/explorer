import {
  Box,
  Chip,
  CircularProgress,
  Link,
  Typography,
  useTheme,
} from "@mui/material";
import type {Types} from "~/types/aptos";
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

  if (!accountData && !objectData) {
    return <EmptyTabContent />;
  }

  let accountInfo = null;
  if (accountData) {
    const keyRotated =
      tryStandardizeAddress(address) !==
      tryStandardizeAddress(accountData.authentication_key);

    accountInfo = (
      <Box marginBottom={3}>
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
      <Box marginBottom={3}>
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
      <Box marginBottom={3}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{mb: 1, color: theme.palette.text.primary}}
        >
          Object Capabilities
        </Typography>
        <ContentBox>
          {refsLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
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
            <Typography variant="body2" color="text.secondary">
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
