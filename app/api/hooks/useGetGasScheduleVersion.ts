import {useGetAccountResource} from "./useGetAccountResource";

interface GasScheduleV2Data {
  feature_version: string;
  entries: unknown[];
}

/**
 * Fetches the current gas schedule feature_version from
 * `0x1::gas_schedule::GasScheduleV2`.
 *
 * Pass `enabled: false` to skip the network request (e.g. when the
 * AIP-141 UI is globally disabled).
 */
export function useGetGasScheduleVersion(enabled = true): number | undefined {
  const {data} = useGetAccountResource(
    enabled ? "0x1" : undefined,
    "0x1::gas_schedule::GasScheduleV2",
  );

  if (!data?.data) return undefined;
  const schedule = data.data as GasScheduleV2Data;
  const version = Number(schedule.feature_version);
  return Number.isFinite(version) ? version : undefined;
}
