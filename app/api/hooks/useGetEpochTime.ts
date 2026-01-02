import {useGetAccountResource} from "./useGetAccountResource";

interface ConfigurationData {
  epoch: string;
  last_reconfiguration_time: string;
}

interface BlockResourceData {
  epoch_interval: string;
}

export function useGetEpochTime() {
  const {data: configuration} = useGetAccountResource(
    "0x1",
    "0x1::reconfiguration::Configuration",
  );

  const {data: blockResource} = useGetAccountResource(
    "0x1",
    "0x1::block::BlockResource",
  );

  // Calculate values during render instead of using useEffect
  let curEpoch: string | undefined;
  let lastEpochTime: string | undefined;
  let epochInterval: string | undefined;

  if (configuration?.data !== undefined) {
    const data = configuration.data as ConfigurationData;
    curEpoch = data.epoch;
    lastEpochTime = data.last_reconfiguration_time;
  }

  if (blockResource?.data !== undefined) {
    const data = blockResource.data as BlockResourceData;
    epochInterval = data.epoch_interval;
  }

  return {curEpoch, lastEpochTime, epochInterval};
}
