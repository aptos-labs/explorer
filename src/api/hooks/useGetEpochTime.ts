import {useGlobalState} from "../../GlobalState";
import {useEffect, useState} from "react";
import {useGetAccountResource} from "./useGetAccountResource";

interface ConfigurationData {
  epoch: string;
  last_reconfiguration_time: string;
}

interface BlockResourceData {
  epoch_interval: string;
}

export function useGetEpochTime() {
  const [state, _] = useGlobalState();
  const [curEpoch, setCurEpoch] = useState<string>();
  const [lastEpochTime, setLastEpochTime] = useState<string>();
  const [epochInterval, setEpochInterval] = useState<string>();

  const {accountResource: configuration} = useGetAccountResource(
    "0x1",
    "0x1::reconfiguration::Configuration",
  );

  const {accountResource: blockResource} = useGetAccountResource(
    "0x1",
    "0x1::block::BlockResource",
  );

  useEffect(() => {
    if (configuration?.data !== undefined) {
      const data = configuration.data as ConfigurationData;
      setCurEpoch(data.epoch);
      setLastEpochTime(data.last_reconfiguration_time);
    }

    if (blockResource?.data !== undefined) {
      const data = blockResource.data as BlockResourceData;
      setEpochInterval(data.epoch_interval);
    }
  }, [configuration?.data, blockResource?.data, state]);

  return {curEpoch, lastEpochTime, epochInterval};
}
