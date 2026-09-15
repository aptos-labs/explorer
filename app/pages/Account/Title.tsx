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
import {useKnownAddressBranding, useKnownAddressName} from "../../data/hooks";
import {useTranslation} from "../../i18n";
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
  const {t} = useTranslation();
  const isDAA = useIsDaaAccount(address);
  const knownBranding = useKnownAddressBranding(address);
  const knownLabel = useKnownAddressName(address);

  let titleKind: "account" | "object" | "other" = "account";
  let title = t("pages.account.entity");
  let description = t("pages.account.description", {address});
  let pageType: PageType = "account";
  let keywords: string[] = ["account", "wallet", "address"];

  if (isMultisig) {
    titleKind = "other";
    title = t("pages.account.multisig");
    description = t("pages.account.multisigDescription", {address});
    keywords = ["multisig", "multi-signature", "account", "governance"];
  } else if (isToken) {
    titleKind = "other";
    pageType = "token";
    keywords = ["token", "NFT", "digital asset"];
    if (isDeleted) {
      title = t("pages.account.deletedTokenObject");
      description = t("pages.account.deletedTokenDescription", {address});
    } else {
      title = t("pages.account.tokenObject");
      description = t("pages.account.tokenDescription", {address});
    }
  } else if (isObject) {
    titleKind = "object";
    pageType = "object";
    if (isDeleted) {
      titleKind = "other";
      title = t("pages.account.deletedObject");
      description = t("pages.account.deletedObjectDescription", {address});
    } else {
      title = t("pages.account.object");
      description = t("pages.account.objectDescription", {address});
    }
    keywords = ["object", "resource", "move"];
  } else if (isDAA) {
    titleKind = "other";
    title = t("pages.account.daa");
    description = t("pages.account.daaDescription", {address});
    keywords = ["DAA", "derivable", "cross-chain", "account"];
  }

  if (knownLabel) {
    if (titleKind === "account") {
      title = t("pages.account.named", {name: knownLabel});
    } else if (titleKind === "object") {
      title = t("pages.account.namedObject", {name: knownLabel});
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
  const tabHead = getAccountTabHeadLabel(pathTab, t);
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
      ? t("pages.account.tabMetaDescription", {
          tab: tabHead,
          kind: objectRoute
            ? t("pages.account.kindObject")
            : t("pages.account.kindAccount"),
          address,
        })
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
    <Stack
      direction="column"
      spacing={2}
      sx={{
        marginX: 1,
      }}
    >
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
              {t("pages.account.daaHeading")}
            </Typography>
            <StyledTooltip
              title={
                <Typography variant="body2">
                  {t("pages.account.daaLearnMore")}
                  <Link
                    href="https://aptos.dev/build/sdks/wallet-adapter/x-chain-accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                  >
                    <Typography variant="body2" sx={{fontWeight: 600}}>
                      {t("pages.account.daaLearnMoreLink")}
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
              {t("pages.account.daaDashboardIntro")}
            </Typography>
            <Link
              href="https://daadashboard.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
            >
              <Typography variant="body2" sx={{fontWeight: 600}}>
                {t("pages.account.daaDashboard")}
              </Typography>
            </Link>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
