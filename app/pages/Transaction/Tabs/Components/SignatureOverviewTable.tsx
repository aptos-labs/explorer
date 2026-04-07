import {Box, Paper, Table, TableRow, Typography, useTheme} from "@mui/material";
import type React from "react";
import HashButton, {HashType} from "../../../../components/HashButton";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import EmptyValue from "../../../../components/IndividualPageContent/ContentValue/EmptyValue";

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
  label: string;
  children: React.ReactNode;
  description?: string;
};

function SignatureFieldRow({
  label,
  children,
  description,
}: SignatureFieldRowProps) {
  const theme = useTheme();
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
        {label}
        {description ? (
          <Typography
            component="div"
            variant="caption"
            sx={{
              display: "block",
              color: theme.palette.text.secondary,
              mt: 0.5,
            }}
          >
            {description}
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
  if (!sig || typeof sig !== "object" || Array.isArray(sig)) {
    return (
      <SignatureFieldRow label="Signer">
        <Typography variant="body2" color="text.secondary">
          <EmptyValue />
        </Typography>
      </SignatureFieldRow>
    );
  }

  const o = sig as Record<string, unknown>;
  const t = typeof o.type === "string" ? o.type : "";

  const isSecp256k1 =
    t.includes("secp256k1") || t === "secp256k1_ecdsa_signature";
  if (
    (t === "ed25519_signature" || isSecp256k1) &&
    isHexString(o.public_key) &&
    isHexString(o.signature)
  ) {
    return (
      <>
        <SignatureFieldRow label="Scheme">
          {humanizeSignatureType(t)}
        </SignatureFieldRow>
        <SignatureFieldRow
          label="Public key"
          description={
            isSecp256k1
              ? "Uncompressed secp256k1 public key (hex)."
              : "32-byte Ed25519 public key (hex)."
          }
        >
          <HashButton hash={o.public_key} type={HashType.OTHERS} />
        </SignatureFieldRow>
        <SignatureFieldRow
          label="Signature"
          description={
            isSecp256k1
              ? "ECDSA signature over the signing message (hex)."
              : "64-byte Ed25519 signature over the signing message (hex)."
          }
        >
          <HashButton hash={o.signature} type={HashType.OTHERS} />
        </SignatureFieldRow>
      </>
    );
  }

  if (
    t === "multi_ed25519_signature" &&
    Array.isArray(o.public_keys) &&
    Array.isArray(o.signatures)
  ) {
    const publicKeys = o.public_keys.filter(isHexString);
    const signatures = o.signatures.filter(isHexString);
    return (
      <>
        <SignatureFieldRow label="Scheme">
          {humanizeSignatureType(t)}
        </SignatureFieldRow>
        {typeof o.threshold === "string" || typeof o.threshold === "number" ? (
          <SignatureFieldRow
            label="Threshold"
            description="Minimum number of signatures required."
          >
            {String(o.threshold)}
          </SignatureFieldRow>
        ) : null}
        {isHexString(o.bitmap) ? (
          <SignatureFieldRow
            label="Bitmap"
            description="Bitmask of which keys signed."
          >
            <HashButton hash={o.bitmap} type={HashType.OTHERS} />
          </SignatureFieldRow>
        ) : null}
        {publicKeys.map((pk, i) => (
          <SignatureFieldRow key={pk} label={`Public key ${i + 1}`}>
            <HashButton hash={pk} type={HashType.OTHERS} />
          </SignatureFieldRow>
        ))}
        {signatures.map((sigHex, i) => (
          <SignatureFieldRow key={sigHex} label={`Signature ${i + 1}`}>
            <HashButton hash={sigHex} type={HashType.OTHERS} />
          </SignatureFieldRow>
        ))}
      </>
    );
  }

  if (t === "single_sender") {
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
          <SignatureFieldRow label="Scheme">
            {humanizeSignatureType(t)}
          </SignatureFieldRow>
          {typeof pkRec.type === "string" ? (
            <SignatureFieldRow label="Public key type">
              {pkRec.type}
            </SignatureFieldRow>
          ) : null}
          {isHexString(pkRec.value) ? (
            <SignatureFieldRow label="Public key">
              <HashButton hash={pkRec.value} type={HashType.OTHERS} />
            </SignatureFieldRow>
          ) : null}
          {typeof sigRec.type === "string" ? (
            <SignatureFieldRow label="Signature type">
              {sigRec.type}
            </SignatureFieldRow>
          ) : null}
          {isHexString(sigRec.value) ? (
            <SignatureFieldRow label="Signature">
              <HashButton hash={sigRec.value} type={HashType.OTHERS} />
            </SignatureFieldRow>
          ) : null}
        </>
      );
    }
  }

  return (
    <SignatureFieldRow label="Signer data">
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
              <SignatureFieldRow label="Raw">
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
        <SignatureFieldRow label="Top-level scheme">
          {humanizeSignatureType(typeField)}
        </SignatureFieldRow>
        <SignatureFieldRow
          label="Sender"
          description="Primary signer authenticator."
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
                  label={`Secondary signer ${i + 1} (address)`}
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
                label={`Secondary signer ${i + 1}`}
                description="Authenticator for this secondary address."
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
        <SignatureFieldRow label="Top-level scheme">
          {humanizeSignatureType(typeField)}
        </SignatureFieldRow>
        {typeof s.fee_payer_address === "string" ? (
          <SignatureFieldRow label="Fee payer address">
            <HashButton hash={s.fee_payer_address} type={HashType.ACCOUNT} />
          </SignatureFieldRow>
        ) : null}
        <SignatureFieldRow
          label="Sender"
          description="Primary signer authenticator."
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
                  label={`Secondary signer ${i + 1} (address)`}
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
                label={`Secondary signer ${i + 1}`}
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
          label="Fee payer signer"
          description="Authenticator used by the fee payer."
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
          <SignatureFieldRow label="Type">{typeField}</SignatureFieldRow>
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
          <SignatureFieldRow label="Raw">
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
