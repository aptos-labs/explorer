import {Banner} from "../../components/Banner";

export function CommissionChangeBanner() {
  return (
    <Banner pillText="INFO" pillColor="warning" sx={{marginBottom: 2}}>
      Commission rates are now subject to change by the operator
    </Banner>
  );
}
