import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {Box, Link, Stack, Typography} from "@mui/material";
import {
  PageMetadata,
  type PageType,
} from "../../components/hooks/usePageMetadata";
import StyledTooltip from "../../components/StyledTooltip";
import TitleHashButton, {
  HashType,
  NameType,
} from "../../components/TitleHashButton";
import {useKnownAddressBranding, useKnownAddressName} from "../../constants";
import {truncateAddress} from "../../utils";
import {getAccountTabHeadLabel} from "./accountTabLabels";
import {useIsDaaAccount} from "./hooks/useIsDaaAccount";

type AccountTitleProps = {
  address: string;
  isMultisig?: boolean;
  isObject?: boolean;
  /** True when rendered under `/object/...` (not `/account/...`) */
  objectRoute?: boolean;
  /** Path tab segment (`transactions`, `coins`, …) when URL includes it */
  pathTab?: string;
  isDeleted?: boolean;
  isToken?: boolean;
};

export default function AccountTitle({
  address,
  isMultisig = false,
  isToken = false,
  isObject = false,
  objectRoute = false,
  pathTab,
  isDeleted = false,
}: AccountTitleProps) {
  const isDAA = useIsDaaAccount(address);
  const knownBranding = useKnownAddressBranding(address);
  const knownLabel = useKnownAddressName(address);

  let title = "Account";
  let description = `View details for Aptos account ${address}. See transactions, resources, modules, coins, and NFTs owned by this account.`;
  let pageType: PageType = "account";
  let keywords: string[] = ["account", "wallet", "address"];

  if (isMultisig) {
    title = "Multisig Account";
    description = `View details for Aptos multisig account ${address}. See pending transactions, owners, and multisig configuration.`;
    keywords = ["multisig", "multi-signature", "account", "governance"];
  } else if (isToken) {
    pageType = "token";
    keywords = ["token", "NFT", "digital asset"];
    if (isDeleted) {
      title = "Deleted Token Object";
      description = `This token object ${address} has been deleted from the Aptos blockchain.`;
    } else {
      title = `Token Object`;
      description = `View token object ${address} on the Aptos blockchain. See token metadata, ownership, and transfer history.`;
    }
  } else if (isObject) {
    pageType = "object";
    if (isDeleted) {
      title = "Deleted Object";
      description = `This object ${address} has been deleted from the Aptos blockchain.`;
    } else {
      title = "Object";
      description = `View object ${address} on the Aptos blockchain. See object resources, ownership, and associated data.`;
    }
    keywords = ["object", "resource", "move"];
  } else if (isDAA) {
    title = "Derivable Aptos Account";
    description = `View derivable Aptos account ${address}. Cross-chain account derived from another blockchain address.`;
    keywords = ["DAA", "derivable", "cross-chain", "account"];
  }

  if (knownLabel) {
    if (title === "Account") {
      title = `${knownLabel} - Account`;
    } else if (title === "Object") {
      title = `${knownLabel} - Object`;
    }
  }

  if (
    knownBranding?.description &&
    !isMultisig &&
    !isToken &&
    !isObject &&
    !isDAA
  ) {
    description = `${knownBranding.description} ${description}`;
  }

  const displayAddr = truncateAddress(address);

  const tab = pathTab ?? "transactions";
  const tabHead = getAccountTabHeadLabel(pathTab);
  const trimmedAddress = address.trim();
  const canonicalPath = trimmedAddress
    ? objectRoute
      ? `/object/${trimmedAddress}/${tab}`
      : `/account/${trimmedAddress}/${tab}`
    : undefined;

  const metadataTitle =
    pathTab !== undefined
      ? `${tabHead} | ${title} ${displayAddr}`
      : `${title} ${displayAddr}`;

  const tabSpecificDescription =
    pathTab !== undefined && address && !isDeleted
      ? `View ${tabHead.toLowerCase()} for ${objectRoute ? "object" : "account"} ${address} on the Aptos blockchain.`
      : null;

  const metadataDescription =
    tabSpecificDescription !== null
      ? knownBranding?.description &&
        !isMultisig &&
        !isToken &&
        !isObject &&
        !isDAA
        ? `${knownBranding.description} ${tabSpecificDescription}`
        : tabSpecificDescription
      : description;

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata
        title={metadataTitle}
        description={metadataDescription}
        type={pageType}
        keywords={keywords}
        {...(canonicalPath ? {canonicalPath} : {})}
      />
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.ACCOUNT} />
        <TitleHashButton
          hash={address}
          type={HashType.NAME}
          nameType={NameType.LABEL}
        />
        <TitleHashButton
          hash={address}
          type={HashType.NAME}
          nameType={NameType.ANS}
        />
      </Stack>
      {isDAA && (
        <Box sx={{mb: 4}}>
          <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
            <Typography variant="body1">
              This is a Derivable Aptos Account
            </Typography>
            <StyledTooltip
              title={
                <Typography variant="body2">
                  Learn more about
                  <Link
                    href="https://aptos.dev/build/sdks/wallet-adapter/x-chain-accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                  >
                    <Typography variant="body2" sx={{fontWeight: 600}}>
                      Derivable Aptos Accounts
                    </Typography>
                  </Link>
                </Typography>
              }
              arrow
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: "info.main",
                  cursor: "help",
                }}
              />
            </StyledTooltip>
          </Box>
          <Stack spacing={1}>
            <Typography variant="body1">
              To get more insights on your derivable aptos accounts, please
              visit the
            </Typography>
            <Link
              href="https://daadashboard.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
            >
              <Typography variant="body2" sx={{fontWeight: 600}}>
                Derivable Aptos Account Dashboard
              </Typography>
            </Link>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
