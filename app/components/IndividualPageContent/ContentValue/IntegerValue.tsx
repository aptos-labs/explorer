import {useTranslation} from "../../../i18n";

type IntegerValueProps = {
  value: string | number | bigint | null | undefined;
};

export default function IntegerValue({value}: IntegerValueProps) {
  const {formatIntegerString} = useTranslation();
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return <>{formatIntegerString(String(value))}</>;
}
