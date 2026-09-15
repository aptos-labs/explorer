import {
  OpenInNew,
  Verified,
  VerifiedUser,
  WarningAmber,
} from "@mui/icons-material";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {Alert, AlertTitle, Box, Button, Stack, useTheme} from "@mui/material";
import {
  type CoinDescription,
  useGetCoinList,
} from "../api/hooks/useGetCoinList";
import {useGetFaPairedCoin} from "../api/hooks/useGetFaPairedCoin";
import {useNetworkName} from "../global-config/GlobalConfig";
import {useTranslation} from "../i18n";
import {Link} from "../routing";
import {
  type VerifiedLevelInfo,
  VerifiedType,
  verifiedLevel,
} from "./Table/VerifiedCell";

type VerificationBannerProps = {
  id: string;
  known: boolean;
  coinData?: CoinDescription;
  symbol?: string;
};

export default function VerificationBanner({
  id,
  known,
  coinData,
  symbol,
}: VerificationBannerProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  const networkName = useNetworkName();
  const isCoin = id?.includes("::") ?? false;

  const {data: pairedCoin} = useGetFaPairedCoin(id);
  const {data: coinList} = useGetCoinList();

  let {level}: VerifiedLevelInfo = {
    level: VerifiedType.UNVERIFIED,
    reason: undefined,
  };

  if (!isCoin && pairedCoin && coinList) {
    const matchedCoin = coinList.data.find(
      (desc) => desc.tokenAddress === pairedCoin,
    );
    if (matchedCoin) {
      const result = verifiedLevel(
        {
          id: pairedCoin,
          known: true,
          isBanned: matchedCoin.isBanned,
          symbol: matchedCoin.symbol,
          isInPanoraTokenList: matchedCoin.isInPanoraTokenList,
        },
        networkName,
      );
      level = result.level;
    } else {
      const result = verifiedLevel(
        {
          id: pairedCoin,
          known,
          symbol,
          isInPanoraTokenList: coinData?.isInPanoraTokenList,
        },
        networkName,
      );
      level = result.level;
    }
  } else {
    const result = verifiedLevel(
      {
        id,
        known,
        symbol,
        isBanned: coinData?.isBanned,
        isInPanoraTokenList: coinData?.isInPanoraTokenList,
      },
      networkName,
    );
    level = result.level;
  }

  if (
    level === VerifiedType.DISABLED ||
    level === VerifiedType.LABS_BANNED ||
    level === VerifiedType.COMMUNITY_BANNED
  ) {
    return null;
  }

  const isVerified =
    level === VerifiedType.NATIVE_TOKEN ||
    level === VerifiedType.LABS_VERIFIED ||
    level === VerifiedType.COMMUNITY_VERIFIED;

  if (isVerified) {
    return (
      <Alert
        severity="success"
        icon={
          level === VerifiedType.NATIVE_TOKEN ? (
            <VerifiedUser />
          ) : level === VerifiedType.LABS_VERIFIED ? (
            <Verified />
          ) : (
            <VerifiedOutlined />
          )
        }
        sx={{
          borderRadius: 2,
          "& .MuiAlert-message": {width: "100%"},
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box>
            <strong>
              {level === VerifiedType.NATIVE_TOKEN
                ? t("verified.banner.nativeTitle")
                : level === VerifiedType.LABS_VERIFIED
                  ? t("verified.banner.labsTitle")
                  : t("verified.banner.communityTitle")}
            </strong>
            {" — "}
            {level === VerifiedType.NATIVE_TOKEN
              ? t("verified.banner.nativeBody")
              : level === VerifiedType.LABS_VERIFIED
                ? t("verified.banner.labsBody")
                : t("verified.banner.communityBody")}
          </Box>
        </Stack>
      </Alert>
    );
  }

  const isRecognized = level === VerifiedType.RECOGNIZED;

  return (
    <Alert
      severity="warning"
      icon={<WarningAmber />}
      sx={{
        borderRadius: 2,
        border: `1.5px solid ${theme.palette.warning.main}`,
        "& .MuiAlert-message": {width: "100%"},
      }}
    >
      <AlertTitle sx={{fontWeight: 700, mb: 0.5}}>
        {isRecognized
          ? t("verified.banner.recognizedTitle")
          : t("verified.banner.unverifiedTitle")}
      </AlertTitle>
      <Stack
        direction={{xs: "column", sm: "row"}}
        spacing={2}
        sx={{
          alignItems: {xs: "flex-start", sm: "center"},
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box>
          {isRecognized
            ? t("verified.banner.recognizedBody")
            : t("verified.banner.unverifiedBody")}
        </Box>
        <Link to="/verification" sx={{textDecoration: "none", flexShrink: 0}}>
          <Button
            variant="contained"
            color="warning"
            size="small"
            endIcon={<OpenInNew fontSize="small" />}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              whiteSpace: "nowrap",
              borderRadius: 2,
              px: 2.5,
              py: 0.75,
            }}
          >
            {t("verified.banner.getVerified")}
          </Button>
        </Link>
      </Stack>
    </Alert>
  );
}
