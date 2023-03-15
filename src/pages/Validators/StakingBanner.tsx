import React from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {Banner} from "../../components/Banner";

export function StakingBanner() {
  const inDev = useGetInDevMode();

  const handleClick = () => {
    // TODO: will add the "open side panel" action here
  };

  return inDev ? (
    <Banner handleClick={handleClick} sx={{marginBottom: 2}}>
      Aptos enables delegations and staking services. See Staking for more
      details.
    </Banner>
  ) : null;
}
