import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import {Box, Chip, Stack, Tooltip} from "@mui/material";
import type {
  DispatchFunctionInfo,
  DispatchHook,
  FaDispatchInfo,
} from "../../../api/hooks/useGetFaIsDispatchable";
import {useTranslation} from "../../../i18n";
import {Link} from "../../../routing";
import {truncateAddress} from "../../utils";

const HOOK_KEYS: Record<DispatchHook, string> = {
  withdraw: "pages.fa.hookWithdraw",
  deposit: "pages.fa.hookDeposit",
  derived_balance: "pages.fa.hookDerivedBalance",
  derived_supply: "pages.fa.hookDerivedSupply",
};

function functionPathLabel(fn: DispatchFunctionInfo): string {
  return `${truncateAddress(fn.moduleAddress)}::${fn.moduleName}::${fn.functionName}`;
}

function functionFullPath(fn: DispatchFunctionInfo): string {
  return `${fn.moduleAddress}::${fn.moduleName}::${fn.functionName}`;
}

/**
 * Renders the "Dispatchable" chip plus, when known, one link per registered
 * dispatch hook pointing at the source module the issuer registered with
 * `0x1::dispatchable_fungible_asset::register_dispatch_functions`.
 */
export default function DispatchablePropertiesValue({
  info,
}: {
  info: FaDispatchInfo;
}) {
  const {t} = useTranslation();
  return (
    <Stack direction="column" spacing={1} sx={{alignItems: "flex-start"}}>
      <Tooltip title={t("pages.fa.dispatchableTip")} arrow>
        <Chip
          size="small"
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          label={t("pages.fa.dispatchable")}
          variant="outlined"
          color={"success"}
        />
      </Tooltip>
      {info.functions.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{flexWrap: "wrap", fontSize: "0.8rem"}}
        >
          {info.functions.map((fn) => {
            const hookLabel = t(HOOK_KEYS[fn.hook]);
            return (
              <Tooltip
                key={fn.hook}
                title={t("pages.fa.hookTooltip", {
                  hook: hookLabel,
                  path: functionFullPath(fn),
                  action: t("pages.fa.viewModuleSource"),
                })}
                arrow
              >
                <Box
                  component="span"
                  sx={{display: "inline-flex", alignItems: "center"}}
                >
                  <Box
                    component="span"
                    sx={{color: "text.secondary", mr: 0.5}}
                  >{`${hookLabel}:`}</Box>
                  <Link
                    to={`/account/${fn.moduleAddress}/modules/code/${fn.moduleName}`}
                    color="primary"
                    underline="hover"
                  >
                    {functionPathLabel(fn)}
                  </Link>
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
