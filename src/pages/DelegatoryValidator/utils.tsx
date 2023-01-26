import {Types} from "aptos";

interface AccountResourceData {
  locked_until_secs: bigint;
}

// returns seconds till locked staking funds getting unlocked
export function getLockedUtilSecs(
  accountResource?: Types.MoveResource | undefined,
): bigint | null {
  return accountResource
    ? BigInt((accountResource.data as AccountResourceData).locked_until_secs)
    : null;
}
