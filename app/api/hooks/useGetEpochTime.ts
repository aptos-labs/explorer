import {moveResourceData} from "../moveResource";
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

  const configurationData = moveResourceData<ConfigurationData>(configuration);
  if (configurationData) {
    curEpoch = configurationData.epoch;
    lastEpochTime = configurationData.last_reconfiguration_time;
  }

  const blockData = moveResourceData<BlockResourceData>(blockResource);
  if (blockData) {
    epochInterval = blockData.epoch_interval;
  }

  return {curEpoch, lastEpochTime, epochInterval};
}
