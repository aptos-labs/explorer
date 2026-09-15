import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {Banner} from "../../../components/Banner";
import {useTranslation} from "../../../i18n";

export function AptosNamesBanner() {
  const inDev = useGetInDevMode();
  const {t} = useTranslation();

  return inDev ? (
    <Banner pillText={t("accountUi.pill.new")} sx={{marginBottom: 2}}>
      {t("accountUi.claimAns")}
    </Banner>
  ) : null;
}
