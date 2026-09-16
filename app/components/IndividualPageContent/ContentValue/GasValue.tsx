import {useTranslation} from "../../../i18n";

type GasValueProps = {
  gas: string;
};

export default function GasValue({gas}: GasValueProps) {
  const {t, formatIntegerString} = useTranslation();
  return <span>{t("common.gasUnits", {count: formatIntegerString(gas)})}</span>;
}
