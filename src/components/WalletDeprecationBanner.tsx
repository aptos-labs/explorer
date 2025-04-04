import {Banner} from "./Banner";

export function WalletDeprecationBanner() {
  return (
    <Banner pillText="NOTICE" pillColor="error" sx={{marginBottom: 2}}>
      Wallets that do not support AIP-62 will be deprecated for submitting
      transactions with the Explorer in an upcoming release by 5/1/2025:
      Martian, Rise, TokenPocket, WellDone
    </Banner>
  );
}
