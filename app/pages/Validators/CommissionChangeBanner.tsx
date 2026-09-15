import {Banner} from "../../components/Banner";
import {useTranslation} from "../../i18n";

export function CommissionChangeBanner() {
  const {t} = useTranslation();
  return (
    <Banner
      pillText={t("accountUi.pill.info")}
      pillColor="warning"
      sx={{marginBottom: 2}}
    >
      {t("staking.commissionChange")}
    </Banner>
  );
}
