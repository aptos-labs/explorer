import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {Banner} from "../../../components/Banner";

export function AptosNamesBanner() {
  const inDev = useGetInDevMode();

  return inDev ? (
    <Banner pillText="NEW" sx={{marginBottom: 2}}>
      Claim your ANS name today!
    </Banner>
  ) : null;
}
