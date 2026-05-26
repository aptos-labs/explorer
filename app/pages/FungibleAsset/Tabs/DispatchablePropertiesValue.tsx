import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import {Box, Chip, Stack, Tooltip} from "@mui/material";
import type {
  DispatchFunctionInfo,
  DispatchHook,
  FaDispatchInfo,
} from "../../../api/hooks/useGetFaIsDispatchable";
import {Link} from "../../../routing";
import {truncateAddress} from "../../utils";

const HOOK_LABEL: Record<DispatchHook, string> = {
  withdraw: "Withdraw",
  deposit: "Deposit",
  derived_balance: "Derived balance",
  derived_supply: "Derived supply",
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
  return (
    <Stack direction="column" spacing={1} sx={{alignItems: "flex-start"}}>
      <Tooltip
        title={
          "Custom dispatch functions are registered for transfers (withdraw/deposit/balance/supply)"
        }
        arrow
      >
        <Chip
          size="small"
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          label={"Dispatchable"}
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
          {info.functions.map((fn) => (
            <Tooltip
              key={fn.hook}
              title={`${HOOK_LABEL[fn.hook]}: ${functionFullPath(fn)} — click to view module source`}
              arrow
            >
              <Box
                component="span"
                sx={{display: "inline-flex", alignItems: "center"}}
              >
                <Box
                  component="span"
                  sx={{color: "text.secondary", mr: 0.5}}
                >{`${HOOK_LABEL[fn.hook]}:`}</Box>
                <Link
                  to={`/account/${fn.moduleAddress}/modules/code/${fn.moduleName}`}
                  color="primary"
                  underline="hover"
                >
                  {functionPathLabel(fn)}
                </Link>
              </Box>
            </Tooltip>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
