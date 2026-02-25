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
          alignItems="center"
          justifyContent="space-between"
          sx={{width: "100%"}}
        >
          <Box>
            <strong>
              {level === VerifiedType.NATIVE_TOKEN
                ? "Native Token"
                : level === VerifiedType.LABS_VERIFIED
                  ? "Verified by Aptos Labs"
                  : "Community Verified"}
            </strong>
            {" — "}
            {level === VerifiedType.NATIVE_TOKEN
              ? "This is a native token of the Aptos blockchain."
              : level === VerifiedType.LABS_VERIFIED
                ? "This asset has been verified by the Aptos Explorer team."
                : "This asset is verified on the Panora community token list."}
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
          ? "This asset is recognized but not fully verified"
          : "This asset is not verified"}
      </AlertTitle>
      <Stack
        direction={{xs: "column", sm: "row"}}
        alignItems={{xs: "flex-start", sm: "center"}}
        justifyContent="space-between"
        spacing={2}
        sx={{width: "100%"}}
      >
        <Box>
          {isRecognized
            ? "This token appears in the Panora token list but has not been fully verified. Get verified to build trust with users."
            : "This token has not been verified by the community or Aptos Labs. Verify your token to build trust and visibility."}
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
            Get Verified
          </Button>
        </Link>
      </Stack>
    </Alert>
  );
}
