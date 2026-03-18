import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {Stack, Typography} from "@mui/material";
import type {Types} from "~/types/aptos";
import {useGetGasScheduleVersion} from "../api/hooks/useGetGasScheduleVersion";
import {
  AIP141_CONFIG,
  isAip141Executed,
  wouldExceedGasLimit,
} from "../utils/aip140";
import {Banner} from "./Banner";

type AIP140GasBannerProps = {
  transaction: Types.Transaction_UserTransaction;
};

export function AIP140GasBanner({transaction}: AIP140GasBannerProps) {
  const gasScheduleVersion = useGetGasScheduleVersion(AIP141_CONFIG.enabled);
  const executed =
    gasScheduleVersion !== undefined && isAip141Executed(gasScheduleVersion);

  if (!AIP141_CONFIG.enabled) return null;

  const {gas_used, max_gas_amount, version} = transaction;
  if (!wouldExceedGasLimit(gas_used, max_gas_amount, version)) return null;

  const projected = BigInt(gas_used) * AIP141_CONFIG.gasMultiplier;
  const projectedStr = projected.toLocaleString();
  const maxGasStr = BigInt(max_gas_amount).toLocaleString();
  const gasUsedStr = BigInt(gas_used).toLocaleString();

  return (
    <Banner pillText="AIP-141" pillColor="warning" sx={{marginBottom: 2}}>
      <Stack direction="row" spacing={1} alignItems="center">
        <WarningAmberIcon sx={{fontSize: 18}} />
        <Typography component="span" sx={{fontSize: "inherit"}}>
          {executed ? (
            <>
              AIP-141 has been executed. This transaction used{" "}
              <strong>{gasUsedStr}</strong> gas units. Under the current gas
              schedule a 10x projection would require ~
              <strong>{projectedStr}</strong> gas units, exceeding its max gas
              limit of <strong>{maxGasStr}</strong>.
            </>
          ) : (
            <>
              This transaction used <strong>{gasUsedStr}</strong> gas units.
              Under AIP-141 (10x gas costs), it would require ~
              <strong>{projectedStr}</strong> gas units, exceeding its max gas
              limit of <strong>{maxGasStr}</strong>.
            </>
          )}
        </Typography>
      </Stack>
    </Banner>
  );
}
