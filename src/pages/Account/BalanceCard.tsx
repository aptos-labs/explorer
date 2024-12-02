import React, {useState, useEffect} from "react";
import {Stack, Typography} from "@mui/material";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {Card} from "../../components/Card";
import {grey} from "../../themes/colors/aptosColorPalette";
import StyledTooltip from "../../components/StyledTooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import {getAPTPrice} from "../../api/hooks/useGetPrice";
import {useGlobalState} from "../../global-config/GlobalConfig";

type BalanceCardProps = {
  address: string;
};

export default function BalanceCard({address}: BalanceCardProps) {
  const balance = useGetAccountAPTBalance(address);
  const [globalState] = useGlobalState();
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const fetchedPrice = await getAPTPrice();
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
        {globalState.network_name === "mainnet" && balanceUSD !== null && (
          <Typography fontSize={14} color={grey[450]}>
            ${balanceUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}{" "}
            USD
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12} color={grey[450]}>
            Balance
          </Typography>
          <StyledTooltip
            title={`This balance reflects the amount of APT tokens held in your wallet${globalState.network_name === "mainnet" ? ` and their live value in USD at a rate of 1 APT = $${price?.toFixed(2)}` : ""}.`}
          >
            <InfoOutlinedIcon sx={{fontSize: 15, color: grey[450]}} />
          </StyledTooltip>
        </Stack>
      </Stack>
    </Card>
  ) : null;
}
