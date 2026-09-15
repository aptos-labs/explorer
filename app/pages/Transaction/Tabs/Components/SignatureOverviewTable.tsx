import {Box, Paper, Table, TableRow, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type TranslateVars, useTranslation} from "../../../../i18n";
import HashButton, {HashType} from "../../../../components/HashButton";
import EmptyValue from "../../../../components/IndividualPageContent/ContentValue/EmptyValue";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";

/** Lets wide hash chips / JSON scroll horizontally on narrow screens without clipping. */
const signatureTableScrollBoxSx = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
} as const;

const signatureValueCellSx = {
  verticalAlign: "top",
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
} as const;

type SignatureFieldRowProps = {
  label?: string;
  labelKey?: string;
  labelVars?: TranslateVars;
  children: React.ReactNode;
  description?: string;
  descriptionKey?: string;
};

function SignatureFieldRow({
  label,
  labelKey,
  labelVars,
  children,
  description,
  descriptionKey,
}: SignatureFieldRowProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  const displayLabel = labelKey ? t(labelKey, labelVars) : label;
  const displayDescription = descriptionKey ? t(descriptionKey) : description;
  return (
    <TableRow
      sx={{
        display: {xs: "block", sm: "table-row"},
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <GeneralTableCell
        component="th"
        scope="row"
        sx={{
          display: {xs: "block", sm: "table-cell"},
          width: {xs: "100%", sm: "38%"},
          boxSizing: "border-box",
          verticalAlign: "top",
          fontWeight: 600,
          color: "text.primary",
          borderBottom: {xs: 0, sm: undefined},
          pb: {xs: 0, sm: undefined},
        }}
      >
        {displayLabel}
        {displayDescription ? (
          <Typography
            component="div"
            variant="caption"
            sx={{
              display: "block",
              color: theme.palette.text.secondary,
              mt: 0.5,
            }}
          >
            {displayDescription}
          </Typography>
        ) : null}
      </GeneralTableCell>
      <GeneralTableCell
        sx={{
          display: {xs: "block", sm: "table-cell"},
          width: {xs: "100%", sm: "62%"},
          boxSizing: "border-box",
          pb: {xs: 2, sm: undefined},
          pt: {xs: 0.5, sm: undefined},
          ...signatureValueCellSx,
          "& .MuiStack-root": {maxWidth: "100%"},
          "& .MuiButton-root": {maxWidth: "100%"},
        }}
      >
        <Box sx={{minWidth: 0, maxWidth: "100%"}}>{children}</Box>
      </GeneralTableCell>
    </TableRow>
  );
}

function SignatureNestedTable({children}: {children: React.ReactNode}) {
  return (
    <Box sx={{...signatureTableScrollBoxSx, mt: {xs: 0, sm: 0.5}}}>
      <Table
        size="small"
        sx={{
          tableLayout: {xs: "auto", sm: "fixed"},
          width: "100%",
          minWidth: 0,
        }}
      >
        {children}
      </Table>
    </Box>
  );
}

function isHexString(value: unknown): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]+$/.test(value);
}

function secondarySignerAuthenticatorKey(
  addresses: unknown[] | undefined,
  index: number,
): string {
  const addr = addresses?.[index];
  return typeof addr === "string"
    ? `secondary-signer-${addr}-${index}`
    : `secondary-signer-${index}`;
}

function humanizeSignatureType(type: string): string {
  const map: Record<string, string> = {
    ed25519_signature: "Ed25519",
    multi_ed25519_signature: "Multi-Ed25519",
    single_sender: "Single sender",
    multi_agent_signature: "Multi-agent",
    fee_payer_signature: "Fee payer",
    secp256k1_ecdsa_signature: "Secp256k1 ECDSA",
  };
  return map[type] ?? type.replaceAll("_", " ");
}

function AccountSignatureRows({sig}: {sig: unknown}): React.ReactNode {
  const {t} = useTranslation();
  if (!sig || typeof sig !== "object" || Array.isArray(sig)) {
    return (
      <SignatureFieldRow labelKey="signature.signer">
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          <EmptyValue />
        </Typography>
      </SignatureFieldRow>
    );
  }

  const o = sig as Record<string, unknown>;
  const sigType = typeof o.type === "string" ? o.type : "";

  const isSecp256k1 =
    sigType.includes("secp256k1") || sigType === "secp256k1_ecdsa_signature";
  if (
    (sigType === "ed25519_signature" || isSecp256k1) &&
    isHexString(o.public_key) &&
    isHexString(o.signature)
  ) {
    return (
      <>
        <SignatureFieldRow labelKey="signature.scheme">
          {humanizeSignatureType(sigType)}
        </SignatureFieldRow>
        <SignatureFieldRow
          labelKey="signature.publicKey"
          description={
            isSecp256k1
              ? t("signature.secp256k1PubKeyDesc")
              : t("signature.ed25519PubKeyDesc")
          }
        >
          <HashButton hash={o.public_key} type={HashType.OTHERS} />
        </SignatureFieldRow>
        <SignatureFieldRow
          labelKey="signature.signature"
          description={
            isSecp256k1
              ? t("signature.secp256k1SigDesc")
              : t("signature.ed25519SigDesc")
          }
        >
          <HashButton hash={o.signature} type={HashType.OTHERS} />
        </SignatureFieldRow>
      </>
    );
  }

  if (
    sigType === "multi_ed25519_signature" &&
    Array.isArray(o.public_keys) &&
    Array.isArray(o.signatures)
  ) {
    const publicKeys = o.public_keys.filter(isHexString);
    const signatures = o.signatures.filter(isHexString);
    return (
      <>
        <SignatureFieldRow labelKey="signature.scheme">
          {humanizeSignatureType(sigType)}
        </SignatureFieldRow>
        {typeof o.threshold === "string" || typeof o.threshold === "number" ? (
          <SignatureFieldRow
            labelKey="signature.threshold"
            descriptionKey="signature.thresholdDesc"
          >
            {String(o.threshold)}
          </SignatureFieldRow>
        ) : null}
        {isHexString(o.bitmap) ? (
          <SignatureFieldRow
            labelKey="signature.bitmap"
            descriptionKey="signature.bitmapDesc"
          >
            <HashButton hash={o.bitmap} type={HashType.OTHERS} />
          </SignatureFieldRow>
        ) : null}
        {publicKeys.map((pk, i) => (
          <SignatureFieldRow
            key={pk}
            labelKey="signature.publicKeyN"
            labelVars={{n: i + 1}}
          >
            <HashButton hash={pk} type={HashType.OTHERS} />
          </SignatureFieldRow>
        ))}
        {signatures.map((sigHex, i) => (
          <SignatureFieldRow
            key={sigHex}
            labelKey="signature.signatureN"
            labelVars={{n: i + 1}}
          >
            <HashButton hash={sigHex} type={HashType.OTHERS} />
          </SignatureFieldRow>
        ))}
      </>
    );
  }

  if (sigType === "single_sender") {
    const pk = o.public_key;
    const signaturePayload = o.signature;
    if (
      pk &&
      typeof pk === "object" &&
      !Array.isArray(pk) &&
      signaturePayload &&
      typeof signaturePayload === "object" &&
      !Array.isArray(signaturePayload)
    ) {
      const pkRec = pk as Record<string, unknown>;
      const sigRec = signaturePayload as Record<string, unknown>;
      return (
        <>
          <SignatureFieldRow labelKey="signature.scheme">
            {humanizeSignatureType(sigType)}
          </SignatureFieldRow>
          {typeof pkRec.type === "string" ? (
            <SignatureFieldRow labelKey="signature.publicKeyType">
              {pkRec.type}
            </SignatureFieldRow>
          ) : null}
          {isHexString(pkRec.value) ? (
            <SignatureFieldRow labelKey="signature.publicKey">
              <HashButton hash={pkRec.value} type={HashType.OTHERS} />
            </SignatureFieldRow>
          ) : null}
          {typeof sigRec.type === "string" ? (
            <SignatureFieldRow labelKey="signature.signatureType">
              {sigRec.type}
            </SignatureFieldRow>
          ) : null}
          {isHexString(sigRec.value) ? (
            <SignatureFieldRow labelKey="signature.signature">
              <HashButton hash={sigRec.value} type={HashType.OTHERS} />
            </SignatureFieldRow>
          ) : null}
        </>
      );
    }
  }

  return (
    <SignatureFieldRow labelKey="signature.signerData">
      <JsonViewCard data={sig} collapsedByDefault />
    </SignatureFieldRow>
  );
}

export type SignatureOverviewTableProps = {
  signature: unknown;
};

/**
 * Structured, table-style summary of transaction `signature` JSON (same layout family as FeeStatementEventView).
 */
export default function SignatureOverviewTable({
  signature,
}: SignatureOverviewTableProps) {
  const {t} = useTranslation();
  if (signature === undefined || signature === null) {
    return (
      <Paper
        variant="outlined"
        sx={{overflow: "hidden", maxWidth: "100%", p: 2}}
      >
        <EmptyValue />
      </Paper>
    );
  }

  if (typeof signature !== "object" || Array.isArray(signature)) {
    return (
      <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
        <Box sx={signatureTableScrollBoxSx}>
          <Table
            size="small"
            sx={{
              tableLayout: {xs: "auto", sm: "fixed"},
              width: "100%",
              minWidth: 0,
            }}
          >
            <GeneralTableBody>
              <SignatureFieldRow labelKey="signature.raw">
                <JsonViewCard data={signature} collapsedByDefault />
              </SignatureFieldRow>
            </GeneralTableBody>
          </Table>
        </Box>
      </Paper>
    );
  }

  const s = signature as Record<string, unknown>;
  const typeField = typeof s.type === "string" ? s.type : "";

  let body: React.ReactNode;

  if (
    typeField === "ed25519_signature" &&
    isHexString(s.public_key) &&
    isHexString(s.signature)
  ) {
    body = <AccountSignatureRows sig={signature} />;
  } else if (typeField === "multi_ed25519_signature") {
    body = <AccountSignatureRows sig={signature} />;
  } else if (typeField === "single_sender") {
    body = <AccountSignatureRows sig={signature} />;
  } else if (typeField === "multi_agent_signature") {
    body = (
      <>
        <SignatureFieldRow labelKey="signature.topLevelScheme">
          {humanizeSignatureType(typeField)}
        </SignatureFieldRow>
        <SignatureFieldRow
          labelKey="signature.sender"
          descriptionKey="signature.senderDesc"
        >
          <Paper
            variant="outlined"
            sx={{overflow: "hidden", maxWidth: "100%", mt: 0.5}}
          >
            <SignatureNestedTable>
              <GeneralTableBody>
                <AccountSignatureRows sig={s.sender} />
              </GeneralTableBody>
            </SignatureNestedTable>
          </Paper>
        </SignatureFieldRow>
        {Array.isArray(s.secondary_signer_addresses) &&
        Array.isArray(s.secondary_signers) ? (
          <>
            {(s.secondary_signer_addresses as unknown[]).map((addr, i) =>
              typeof addr === "string" ? (
                <SignatureFieldRow
                  key={
                    // biome-ignore lint/suspicious/noArrayIndexKey: same address may appear twice; index disambiguates list position
                    `secondary-address-${addr}-${i}`
                  }
                  labelKey="signature.secondarySignerAddressN"
                  labelVars={{n: i + 1}}
                >
                  <HashButton hash={addr} type={HashType.ACCOUNT} />
                </SignatureFieldRow>
              ) : null,
            )}
            {(s.secondary_signers as unknown[]).map((sub, i) => (
              <SignatureFieldRow
                key={secondarySignerAuthenticatorKey(
                  s.secondary_signer_addresses as unknown[] | undefined,
                  i,
                )}
                labelKey="signature.secondarySignerN"
                labelVars={{n: i + 1}}
                descriptionKey="signature.secondarySignerDesc"
              >
                <Paper
                  variant="outlined"
                  sx={{overflow: "hidden", maxWidth: "100%", mt: 0.5}}
                >
                  <SignatureNestedTable>
                    <GeneralTableBody>
                      <AccountSignatureRows sig={sub} />
                    </GeneralTableBody>
                  </SignatureNestedTable>
                </Paper>
              </SignatureFieldRow>
            ))}
          </>
        ) : null}
      </>
    );
  } else if (typeField === "fee_payer_signature") {
    body = (
      <>
        <SignatureFieldRow labelKey="signature.topLevelScheme">
          {humanizeSignatureType(typeField)}
        </SignatureFieldRow>
        {typeof s.fee_payer_address === "string" ? (
          <SignatureFieldRow labelKey="signature.feePayerAddress">
            <HashButton hash={s.fee_payer_address} type={HashType.ACCOUNT} />
          </SignatureFieldRow>
        ) : null}
        <SignatureFieldRow
          labelKey="signature.sender"
          descriptionKey="signature.senderDesc"
        >
          <Paper
            variant="outlined"
            sx={{overflow: "hidden", maxWidth: "100%", mt: 0.5}}
          >
            <SignatureNestedTable>
              <GeneralTableBody>
                <AccountSignatureRows sig={s.sender} />
              </GeneralTableBody>
            </SignatureNestedTable>
          </Paper>
        </SignatureFieldRow>
        {Array.isArray(s.secondary_signer_addresses) &&
        Array.isArray(s.secondary_signers) ? (
          <>
            {(s.secondary_signer_addresses as unknown[]).map((addr, i) =>
              typeof addr === "string" ? (
                <SignatureFieldRow
                  key={
                    // biome-ignore lint/suspicious/noArrayIndexKey: same address may appear twice; index disambiguates list position
                    `secondary-address-${addr}-${i}`
                  }
                  labelKey="signature.secondarySignerAddressN"
                  labelVars={{n: i + 1}}
                >
                  <HashButton hash={addr} type={HashType.ACCOUNT} />
                </SignatureFieldRow>
              ) : null,
            )}
            {(s.secondary_signers as unknown[]).map((sub, i) => (
              <SignatureFieldRow
                key={secondarySignerAuthenticatorKey(
                  s.secondary_signer_addresses as unknown[] | undefined,
                  i,
                )}
                labelKey="signature.secondarySignerN"
                labelVars={{n: i + 1}}
              >
                <Paper
                  variant="outlined"
                  sx={{overflow: "hidden", maxWidth: "100%", mt: 0.5}}
                >
                  <SignatureNestedTable>
                    <GeneralTableBody>
                      <AccountSignatureRows sig={sub} />
                    </GeneralTableBody>
                  </SignatureNestedTable>
                </Paper>
              </SignatureFieldRow>
            ))}
          </>
        ) : null}
        <SignatureFieldRow
          labelKey="signature.feePayerSigner"
          descriptionKey="signature.feePayerSignerDesc"
        >
          <Paper
            variant="outlined"
            sx={{overflow: "hidden", maxWidth: "100%", mt: 0.5}}
          >
            <SignatureNestedTable>
              <GeneralTableBody>
                <AccountSignatureRows sig={s.fee_payer_signer} />
              </GeneralTableBody>
            </SignatureNestedTable>
          </Paper>
        </SignatureFieldRow>
      </>
    );
  } else {
    const {type: _t, ...rest} = s;
    const restEntries = Object.entries(rest).filter(
      ([, v]) => v !== undefined && v !== null,
    );
    const simpleObject =
      restEntries.length > 0 &&
      restEntries.every(
        ([, v]) =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean",
      );

    body = (
      <>
        {typeField ? (
          <SignatureFieldRow labelKey="signature.type">
            {typeField}
          </SignatureFieldRow>
        ) : null}
        {simpleObject ? (
          restEntries.map(([key, value]) => (
            <SignatureFieldRow key={key} label={key.replaceAll("_", " ")}>
              {typeof value === "string" && isHexString(value) ? (
                <HashButton hash={value} type={HashType.OTHERS} />
              ) : (
                String(value)
              )}
            </SignatureFieldRow>
          ))
        ) : (
          <SignatureFieldRow labelKey="signature.raw">
            <JsonViewCard data={signature} collapsedByDefault />
          </SignatureFieldRow>
        )}
      </>
    );
  }

  return (
    <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
      <Box sx={signatureTableScrollBoxSx}>
        <Table
          size="small"
          sx={{
            tableLayout: {xs: "auto", sm: "fixed"},
            width: "100%",
            minWidth: 0,
          }}
        >
          <GeneralTableBody>{body}</GeneralTableBody>
        </Table>
      </Box>
    </Paper>
  );
}
