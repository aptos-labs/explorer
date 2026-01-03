import React, {useState, useEffect} from "react";
import {Link, Stack, Typography} from "@mui/material";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {Card} from "../../components/Card";
import {useTheme} from "@mui/material";
import StyledTooltip from "../../components/StyledTooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import {getPrice} from "../../api/hooks/useGetPrice";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {OpenInNew} from "@mui/icons-material";

type BalanceCardProps = {
  address: string;
};

export default function BalanceCard({address}: BalanceCardProps) {
  const theme = useTheme();
  const balance = useGetAccountAPTBalance(address);
  const networkName = useNetworkName();
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const fetchedPrice = await getPrice();
        setPrice(fetchedPrice);
      } catch (error) {
        console.error("Error fetching APT price:", error);
        setPrice(null);
      }
    };

    fetchPrice();
  }, []);

  const balanceUSD =
    balance.data && price !== null
      ? (Number(balance.data) * Number(price)) / 10e7
      : null;

  return balance.data ? (
    <Card height="auto">
      <Stack spacing={1.5} marginY={1}>
        {/* APT balance */}
        <Typography fontSize={17} fontWeight={700}>
          {`${getFormattedBalanceStr(balance.data)} APT`}
        </Typography>

        {/* USD value */}
        {networkName === "mainnet" && balanceUSD !== null && (
          <Typography fontSize={14} color={theme.palette.text.secondary}>
            ${balanceUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}{" "}
            USD
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12} color={theme.palette.text.secondary}>
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

        <Stack direction="row" spacing={1} alignItems="center">
          <Link
            href={`https://aptos.lightscan.one/portfolio/${address}`}
            underline="none"
            fontSize={12}
            target="_blank"
            rel="noopener noreferrer"
          >
            DeFi positions on Lightscan <OpenInNew sx={{fontSize: 12}} />
          </Link>
        </Stack>
      </Stack>
    </Card>
  ) : null;
}
