import {useGetAccountResource} from "./useGetAccountResource";

interface GasScheduleV2Data {
  feature_version: string;
  entries: unknown[];
}

/**
 * Fetches the current gas schedule feature_version from
 * `0x1::gas_schedule::GasScheduleV2`.
 */
export function useGetGasScheduleVersion(): number | undefined {
  const {data} = useGetAccountResource(
    "0x1",
    "0x1::gas_schedule::GasScheduleV2",
  );

  if (!data?.data) return undefined;
  const schedule = data.data as GasScheduleV2Data;
  const version = Number(schedule.feature_version);
  return Number.isFinite(version) ? version : undefined;
}
