import {OpenInNew} from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  FormControl,
  Link,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useState} from "react";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import {useGetPrice} from "../../api/hooks/useGetPrice";
import {Card} from "../../components/Card";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StyledTooltip from "../../components/StyledTooltip";
import {useNetworkName} from "../../global-config/GlobalConfig";

type BalanceCardProps = {
  address: string;
};

type PortfolioProvider = "lightscan" | "yieldai";

const portfolioProviders: Record<
  PortfolioProvider,
  {label: string; getUrl: (address: string) => string}
> = {
  lightscan: {
    label: "Lightscan",
    getUrl: (address) => `https://aptos.lightscan.one/portfolio/${address}`,
  },
  yieldai: {
    label: "Yield AI",
    getUrl: (address) => `https://yieldai.app/portfolio/${address}`,
  },
};

export default function BalanceCard({address}: BalanceCardProps) {
  const theme = useTheme();
  const balance = useGetAccountAPTBalance(address);
  const networkName = useNetworkName();
  // Use the shared React-Query–backed hook so the APT price is cached and
  // reused across pages — previously this component called `getPrice()`
  // inside a `useEffect` on every mount, re-issuing a CoinGecko request
  // on every account-page navigation.
  const {data: priceData} = useGetPrice();
  const price = priceData ?? null;
  const [portfolioProvider, setPortfolioProvider] =
    useState<PortfolioProvider>("yieldai");

  const handleProviderChange = (event: SelectChangeEvent) => {
    setPortfolioProvider(event.target.value as PortfolioProvider);
  };

  const balanceUSD =
    balance.data && price !== null
      ? (Number(balance.data) * Number(price)) / 10e7
      : null;

  const selectedProvider = portfolioProviders[portfolioProvider];

  return balance.data ? (
    <Card sx={{height: "auto"}}>
      <Stack
        spacing={1.5}
        sx={{
          marginY: 1,
        }}
      >
        {/* APT balance */}
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          {`${getFormattedBalanceStr(balance.data)} APT`}
        </Typography>

        {/* USD value */}
        {networkName === "mainnet" && balanceUSD !== null && (
          <Typography
            color={theme.palette.text.secondary}
            sx={{
              fontSize: 14,
            }}
          >
            ${balanceUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}{" "}
            USD
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Typography
            color={theme.palette.text.secondary}
            sx={{
              fontSize: 12,
            }}
          >
            Balance
          </Typography>
          <StyledTooltip
            title={`This balance reflects the amount of APT tokens held in your wallet${networkName === "mainnet" ? ` and their live value in USD at a rate of 1 APT = $${price?.toFixed(2)}` : ""}.`}
          >
            <InfoOutlinedIcon
              sx={{fontSize: 15, color: theme.palette.text.secondary}}
            />
          </StyledTooltip>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Typography
            id="defi-positions-provider-label"
            color={theme.palette.text.secondary}
            sx={{
              fontSize: 12,
            }}
          >
            DeFi positions on
          </Typography>
          <FormControl size="small" sx={{minWidth: 100}}>
            <Select
              value={portfolioProvider}
              onChange={handleProviderChange}
              inputProps={{"aria-labelledby": "defi-positions-provider-label"}}
              sx={{
                fontSize: 12,
                color: theme.palette.text.primary,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.divider,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "& .MuiSelect-select": {
                  py: 0.5,
                  px: 1,
                },
              }}
            >
              {(Object.keys(portfolioProviders) as PortfolioProvider[]).map(
                (provider) => (
                  <MenuItem key={provider} value={provider} sx={{fontSize: 12}}>
                    {portfolioProviders[provider].label}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <Link
            href={selectedProvider.getUrl(address)}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open portfolio on ${selectedProvider.label} in new tab`}
            sx={{
              fontSize: 12,
            }}
          >
            <OpenInNew sx={{fontSize: 12}} />
          </Link>
        </Stack>
      </Stack>
    </Card>
  ) : null;
}
