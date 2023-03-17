import React, {useState} from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {Banner} from "../../components/Banner";
import {StakingDrawer} from "./StakingDrawer";

export function StakingBanner() {
  const inDev = useGetInDevMode();
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return inDev ? (
    <>
      <Banner handleClick={handleClick} sx={{marginBottom: 2}}>
        Aptos enables delegations and staking services. See Staking for more
        details.
      </Banner>
      <StakingDrawer open={open} handleClick={handleClick} />
    </>
  ) : null;
}
