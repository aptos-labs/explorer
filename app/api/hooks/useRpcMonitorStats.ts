import {useSyncExternalStore} from "react";
import {getRpcMonitorStats, subscribeRpcMonitor} from "../rpcMonitor";

export function useRpcMonitorStats() {
  return useSyncExternalStore(
    subscribeRpcMonitor,
    getRpcMonitorStats,
    getRpcMonitorStats,
  );
}
