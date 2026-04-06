import {Paper, Table, TableRow, Typography, useTheme} from "@mui/material";
import type React from "react";
import HashButton, {HashType} from "../../../../components/HashButton";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import EmptyValue from "../../../../components/IndividualPageContent/ContentValue/EmptyValue";

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
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <GeneralTableCell
        component="th"
        scope="row"
        sx={{
          verticalAlign: "top",
          fontWeight: 600,
          color: "text.primary",
          width: "38%",
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
      <GeneralTableCell sx={{verticalAlign: "top"}}>
        {children}
      </GeneralTableCell>
    </TableRow>
  );
}

function isHexString(value: unknown): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]+$/.test(value);
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
    const sig = o.signature;
    if (
      pk &&
      typeof pk === "object" &&
      !Array.isArray(pk) &&
      sig &&
      typeof sig === "object" &&
      !Array.isArray(sig)
    ) {
      const pkRec = pk as Record<string, unknown>;
      const sigRec = sig as Record<string, unknown>;
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
      <Paper variant="outlined" sx={{overflow: "hidden", p: 2}}>
        <EmptyValue />
      </Paper>
    );
  }

  if (typeof signature !== "object" || Array.isArray(signature)) {
    return (
      <Paper variant="outlined" sx={{overflow: "hidden"}}>
        <Table size="small" sx={{tableLayout: "fixed"}}>
          <GeneralTableBody>
            <SignatureFieldRow label="Raw">
              <JsonViewCard data={signature} collapsedByDefault />
            </SignatureFieldRow>
          </GeneralTableBody>
        </Table>
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
          <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
            <Table size="small" sx={{tableLayout: "fixed"}}>
              <GeneralTableBody>
                <AccountSignatureRows sig={s.sender} />
              </GeneralTableBody>
            </Table>
          </Paper>
        </SignatureFieldRow>
        {Array.isArray(s.secondary_signer_addresses) &&
        Array.isArray(s.secondary_signers) ? (
          <>
            {(s.secondary_signer_addresses as unknown[]).map((addr, i) =>
              typeof addr === "string" ? (
                <SignatureFieldRow
                  key={addr}
                  label={`Secondary signer ${i + 1} (address)`}
                >
                  <HashButton hash={addr} type={HashType.ACCOUNT} />
                </SignatureFieldRow>
              ) : null,
            )}
            {(s.secondary_signers as unknown[]).map((sub, i) => (
              <SignatureFieldRow
                key={JSON.stringify(sub)}
                label={`Secondary signer ${i + 1}`}
                description="Authenticator for this secondary address."
              >
                <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
                  <Table size="small" sx={{tableLayout: "fixed"}}>
                    <GeneralTableBody>
                      <AccountSignatureRows sig={sub} />
                    </GeneralTableBody>
                  </Table>
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
          <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
            <Table size="small" sx={{tableLayout: "fixed"}}>
              <GeneralTableBody>
                <AccountSignatureRows sig={s.sender} />
              </GeneralTableBody>
            </Table>
          </Paper>
        </SignatureFieldRow>
        {Array.isArray(s.secondary_signer_addresses) &&
        Array.isArray(s.secondary_signers) ? (
          <>
            {(s.secondary_signer_addresses as unknown[]).map((addr, i) =>
              typeof addr === "string" ? (
                <SignatureFieldRow
                  key={addr}
                  label={`Secondary signer ${i + 1} (address)`}
                >
                  <HashButton hash={addr} type={HashType.ACCOUNT} />
                </SignatureFieldRow>
              ) : null,
            )}
            {(s.secondary_signers as unknown[]).map((sub, i) => (
              <SignatureFieldRow
                key={JSON.stringify(sub)}
                label={`Secondary signer ${i + 1}`}
              >
                <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
                  <Table size="small" sx={{tableLayout: "fixed"}}>
                    <GeneralTableBody>
                      <AccountSignatureRows sig={sub} />
                    </GeneralTableBody>
                  </Table>
                </Paper>
              </SignatureFieldRow>
            ))}
          </>
        ) : null}
        <SignatureFieldRow
          label="Fee payer signer"
          description="Authenticator used by the fee payer."
        >
          <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
            <Table size="small" sx={{tableLayout: "fixed"}}>
              <GeneralTableBody>
                <AccountSignatureRows sig={s.fee_payer_signer} />
              </GeneralTableBody>
            </Table>
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
    <Paper variant="outlined" sx={{overflow: "hidden"}}>
      <Table size="small" sx={{tableLayout: "fixed"}}>
        <GeneralTableBody>{body}</GeneralTableBody>
      </Table>
    </Paper>
  );
}
