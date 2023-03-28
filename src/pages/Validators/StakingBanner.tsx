import React, {useState} from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {Banner} from "../../components/Banner";
import {StakingDrawer} from "./StakingDrawer";
import {Button, Typography} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export function StakingBanner() {
  const inDev = useGetInDevMode();
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const learnMoreButton = (
    <Button variant="text" onClick={handleClick}>
      <Typography>LEARN MORE</Typography>
      <ArrowForwardIosIcon sx={{marginLeft: 2}} fontSize="small" />
    </Button>
  );

  return inDev ? (
    <>
      <Banner action={learnMoreButton} sx={{marginBottom: 2}}>
        Aptos enables delegations and staking services. See Staking for more
        details.
      </Banner>
      <StakingDrawer open={open} handleClick={handleClick} />
    </>
  ) : null;
}
