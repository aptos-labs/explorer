import {Banner} from "./Banner";

export function WalletDeprecationBanner() {
  return (
    <Banner pillText="NOTICE" pillColor="warning" sx={{marginBottom: 2}}>
      Wallets that do not support AIP-62 were deprecated for submitting
      transactions with the Explorer on May 5th, 2025. This includes wallets:
      Martian, Rise, WellDone
    </Banner>
  );
}
