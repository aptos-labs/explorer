import {useEffect, useState} from "react";
import {
  isAccountTokenFlowTabBuildEnabled,
  isTokenFlowAccessSatisfied,
  loadTokenFlowGraphSettings,
} from "../settings/tokenFlowGraphSettings";

/**
 * Account "Token flow" tab is shown when the build enables it, optional access
 * key matches, and the user turned on token tracking in Settings.
 */
export function useAccountTokenFlowTabEligible(): boolean {
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener("storage", bump);
    window.addEventListener("aptos-explorer-token-flow-settings", bump);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener("aptos-explorer-token-flow-settings", bump);
    };
  }, []);

  if (!isAccountTokenFlowTabBuildEnabled()) {
    return false;
  }

  const settings = loadTokenFlowGraphSettings();
  return settings.userEnabled && isTokenFlowAccessSatisfied(settings);
}
