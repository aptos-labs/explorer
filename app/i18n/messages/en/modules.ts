export const modules = {
  code: "Code",
  copyCode: "copy code",
  download: "download",
  publishedSource: "Published Source",
  decompiled: "Decompiled",
  disassembly: "Disassembly",
  abi: "ABI",
  enableDecompilation: "Enable decompilation in Settings",
  publishedSourceNote:
    "The source code is plain text uploaded by the deployer, which can be different from the actual bytecode.",
  generatedNote:
    "This view is generated from on-chain bytecode using the Move decompiler WASM.",
  abiNote: "Module ABI metadata returned by the node for this on-chain module.",
  loadingAbi: "Loading module ABI...",
  noSourceOrBytecode:
    "This module does not expose published source or bytecode for decompilation.",
  failedDecompile: "Failed to decompile module",
  failedFetchBytecode: "Failed to fetch module bytecode",
  fetchingBytecode: "Fetching module bytecode…",
  decompiling: "Decompiling…",
  codeTooltip:
    "Published source can differ from on-chain bytecode. Decompiled output is generated directly from on-chain bytecode with the Move decompiler WASM.",
  noPublishedSource:
    "No published source in package metadata for this address. If this account has Move modules on chain, open the **Run** or **View** tab (module list comes from the modules API), or fetch bytecode via `/accounts/{address}/module/{name}`.",
  noPublishedPackage:
    "No published package metadata for this address. Move modules may still exist on chain (for example legacy publishes); try the **Code** tab, or use the REST API `/accounts/{address}/modules`.",
  noModuleNamed: "No module found with name: {name}",
  noPackageNamed: "No package found with name: {name}",
  selectModule: "Select a module",
  selectPackage: "Select a package",
  sourceDigest: "Source Digest",
  packageManifest: "Package Manifest",
  viewingHistorical: "Viewing historical version {version}",
  versionLatestOnly: "Version: Latest (only latest available)",
  versionLatest: "Version: Latest",
  onePublish: "(1 publish transaction)",
  latest: "Latest",
  current: "current",
  versionN: "Version {version}",
  exitDiff: "Exit Diff",
  compare: "Compare",
  baseOld: "Base (old)",
  compareNew: "Compare (new)",
  policy: {
    unknown: "Unknown",
    arbitrary: "Arbitrary",
    compatible: "Compatible",
    immutable: "Immutable",
  },
  versionPrefix: "Version:",
  packageName: "Package Name",
  upgradePolicy: "Upgrade Policy",
  upgradeNumber: "Upgrade Number",
  modulesLabel: "Modules",
  noPublishedSourceAvailable:
    "Published source is not available for this module.",
  noBytecodeAvailable: "Module bytecode is not available for decompilation.",
  decompilingModule: "Decompiling module bytecode...",
  failedDecompileBytecode: "Failed to decompile module bytecode: {error}",
  noDiff: "No differences between {base} and {compare} for module **{name}**",
  viewInParens: " ({view} view)",
  entryFunctionsBytecode: "{count} entry functions | Bytecode: {size} KB",
  selectModuleToCompare:
    "Select a module from the sidebar to compare versions.",
  publishedSourceUnavailableAtVersions:
    "Published source is not available for module **{name}** at these versions. Try the Decompiled or Disassembly view instead.",
} as const;

export const accountUi = {
  exists: "Exists",
  notCreated: "Not Created",
  scanningCreation: "Scanning creation transaction...",
  showZeroBalance: "Show Zero Balance",
  showEmojicoins: "Show Emojicoins",
  coin: "Coin",
  fungibleAsset: "Fungible Asset",
  fa: "FA",
  confidentialBalanceTip:
    "This account also holds a confidential (encrypted) balance for this asset. The amount is hidden on-chain and is not included in the values shown.",
  noCoinsFound: "No coins found",
  coinsFound: "{count} coins found",
  loadingMarketData: " (loading market data...)",
  noTokensFound: "No tokens found",
  claimAns: "Claim your ANS name today!",
  pill: {
    info: "INFO",
    new: "NEW",
    defunct: "MAY BE DEFUNCT",
    multisig: "MULTISIG",
  },
  defunctWithPlugin:
    "This protocol ({name}) may be defunct. A withdrawal plugin is available to recover your funds.",
  defunctNoPlugin:
    "This protocol ({name}) may be defunct and is no longer actively maintained.",
  withdrawFunds: "Withdraw Funds",
  withdrawFrom: "Withdraw from {name}",
  withdrawMinOwner:
    "At least {percent}% of withdrawn funds will be returned to the original owner / requester.",
  ownerReceives: "Owner receives",
  operatorFee: "Operator fee",
  entryFunction: "Entry function",
  withdrawWarning:
    "Connect your wallet and interact with the protocol's contract directly to execute the withdrawal. Verify the transaction details carefully before signing.",
  openPetraVault: "Open in Petra Vault",
  manageMultisig: "Manage this multisig account with Petra Vault",
} as const;

export const releasesUi = {
  prerelease: "Pre-release",
  version: "Version",
  published: "Published",
  link: "Link",
  recentReleases: "Recent releases ({count})",
  recentAria: "Recent {name} releases",
  latestStable: "Latest stable release",
  noStable: "No stable release found — showing latest pre-release",
  viewRelease: "View release →",
} as const;

export const confidential = {
  epoch: "Epoch",
  round: "Round",
  decryptionKey: "Decryption key",
  encryptionKey: "Encryption key",
  set: "Set",
  notSet: "Not set",
  copyDecryptionKey: "Copy decryption key bytes",
  copyEncryptionKey: "Copy encryption key bytes",
  keyBytes: "Key bytes (hex)",
  allowList: "Allow list",
  globalAuditorKey: "Global auditor key",
  auditorKeyBytes: "Auditor key bytes (hex)",
  copyAuditorKey: "Copy auditor encryption key bytes",
  globalAuditorEpoch: "Global auditor epoch",
  poolExtendRef: "Pool extend ref",
  rawResourceData: "Raw resource data",
  introBlock:
    "Per-block decryption key updated in each block prologue; used to decrypt encrypted transactions in that block. See ",
  introEpoch:
    "Epoch-scoped encryption key from Chunky DKG, used for encrypted transactions during that epoch. Stored on the Aptos framework account; see ",
  introGlobal:
    "Protocol-wide confidential asset settings on the Aptos framework account (allow list, global auditor, pool object). Asset-specific auditors override the global auditor when set. See ",
  epochDescBlock: "Epoch of the block this key applies to.",
  roundDesc: "Consensus round within the epoch.",
  decryptionKeyDesc:
    "Key for this block; None until the prologue installs one.",
  epochDescEnc: "Epoch this key is valid for.",
  encryptionKeyDesc:
    "Derived from the DKG result; None until the epoch key is installed.",
  allowListDesc:
    "When enabled, only allow-listed asset types can use confidential transfers.",
  globalAuditorKeyDesc:
    "Optional auditor encryption key; asset-specific auditors take precedence.",
  globalAuditorEpochDesc:
    "Increments when the global auditor key is installed or rotated.",
  poolExtendRefDesc:
    "Object used to derive the signer that owns confidential-asset pools.",
} as const;

export const signature = {
  signer: "Signer",
  scheme: "Scheme",
  publicKey: "Public key",
  signature: "Signature",
  threshold: "Threshold",
  bitmap: "Bitmap",
  publicKeyType: "Public key type",
  signatureType: "Signature type",
  signerData: "Signer data",
  raw: "Raw",
  topLevelScheme: "Top-level scheme",
  sender: "Sender",
  feePayerAddress: "Fee payer address",
  feePayerSigner: "Fee payer signer",
  type: "Type",
  publicKeyN: "Public key {n}",
  signatureN: "Signature {n}",
  secondarySignerN: "Secondary signer {n}",
  secondarySignerAddressN: "Secondary signer {n} (address)",
  secp256k1PubKeyDesc: "Uncompressed secp256k1 public key (hex).",
  ed25519PubKeyDesc: "32-byte Ed25519 public key (hex).",
  secp256k1SigDesc: "ECDSA signature over the signing message (hex).",
  ed25519SigDesc: "64-byte Ed25519 signature over the signing message (hex).",
  thresholdDesc: "Minimum number of signatures required.",
  bitmapDesc: "Bitmask of which keys signed.",
  senderDesc: "Primary signer authenticator.",
  secondarySignerDesc: "Authenticator for this secondary address.",
  feePayerSignerDesc: "Authenticator used by the fee payer.",
} as const;

export const trace = {
  openSentio: "Open Sentio’s interactive trace viewer",
  title: "Move call trace",
  body: "Execution tree from Sentio’s traced fullnode (experimental). Links open caller and callee accounts and the module Run tab in this explorer; Sentio’s viewer is linked below.",
  mainnetOnly: "Call traces are only fetched for Aptos mainnet in this build.",
  failedLoad: "Failed to load trace.",
  txnFailed:
    "Transaction failed{detail}. The failed call is highlighted below.",
  rawJson: "Raw response (JSON)",
  unexpectedShape:
    "Trace response had an unexpected shape; showing raw JSON only.",
} as const;
