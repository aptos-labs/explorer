import React, {useState, useEffect} from "react";
import {Link, Stack, Typography} from "@mui/material";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {Card} from "../../components/Card";
import {grey} from "../../themes/colors/libra2ColorPalette";
import StyledTooltip from "../../components/StyledTooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import {getPrice} from "../../api/hooks/useGetPrice";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {OpenInNew} from "@mui/icons-material";

type BalanceCardProps = {
  address: string;
  coinType?: `0x${string}::${string}::${string}`; // 新
  symbol?: string;                                 // 新
  decimals?: number;                               // 新，默认 8
};

export default function BalanceCard({
  address,
  coinType,
  symbol,
  decimals = 8,
}: BalanceCardProps) {
  const APT = "0x1::aptos_coin::AptosCoin" as const;
  const theType = coinType ?? APT;
  const isAPT = theType === APT;

  // 查询余额（已支持任意 coinType）
  const balance = useGetAccountAPTBalance(address, theType);

  const [globalState] = useGlobalState();
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!isAPT) { setPrice(null); return; }    // 非 APT 不取价
    (async () => {
      try { setPrice(await getPrice()); } catch { setPrice(null); }
    })();
  }, [isAPT]);

  const sym = symbol ?? (isAPT ? "APT" : "LBT");
  const balanceUSD =
    isAPT && balance.data && price !== null
      ? (Number(balance.data) * Number(price)) / 1e8
      : null;

  // ——从这里开始：无论如何都渲染，便于你看到加载/报错原因——
  return (
    <Card height="auto">
      <Stack spacing={1.5} marginY={1}>
        {/* 临时调试：看 coinType 和状态 */}
        <Typography fontSize={12} color={grey[450]}>
          coinType: {theType}
        </Typography>
        {balance.isLoading && (
          <Typography fontSize={14} color={grey[450]}>Loading balance…</Typography>
        )}
        {balance.error && (
          <Typography fontSize={12} color="error.main">
            {String((balance.error as any)?.message ?? balance.error)}
          </Typography>
        )}

        {/* 主余额（拿到 data 才显示数值） */}
        {balance.data && (
          <>
            <Typography fontSize={17} fontWeight={700}>
              {`${getFormattedBalanceStr(balance.data, decimals as any)} ${sym}`}
            </Typography>

            {isAPT && globalState.network_name === "mainnet" && balanceUSD !== null && (
              <Typography fontSize={14} color={grey[450]}>
                ${balanceUSD.toLocaleString(undefined, {maximumFractionDigits: 2})} USD
              </Typography>
            )}
          </>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12} color={grey[450]}>Balance</Typography>
          <StyledTooltip
            title={`This balance reflects the amount of ${sym} tokens held in your wallet${
              isAPT && globalState.network_name === "mainnet"
                ? ` and their live value in USD at a rate of 1 APT = $${price?.toFixed(2)}`
                : ""
            }.`}
          >
            <InfoOutlinedIcon sx={{fontSize: 15, color: grey[450]}} />
          </StyledTooltip>
        </Stack>

        {/* Lightscan 链接只对 APT 有意义 */}
        {isAPT && (
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
        )}
      </Stack>
    </Card>
  );
}