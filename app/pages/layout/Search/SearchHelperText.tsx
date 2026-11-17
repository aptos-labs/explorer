import {Box} from "@mui/material";
import {LearnMoreTooltip} from "../../../components/IndividualPageContent/LearnMoreTooltip";
import {useTranslation} from "../../../i18n";

/**
 * Search helper copy plus the ANS tooltip. Renders block elements, so the
 * owning TextField must set `slotProps.formHelperText.component` to `"div"`
 * (MUI's default `<p>` cannot contain a `<div>`).
 */
export default function SearchHelperText() {
  const {t} = useTranslation();
  return (
    <Box sx={{display: "inline-flex", alignItems: "center", gap: 0.5}}>
      {t("search.helper")}
      <LearnMoreTooltip
        text={t("tooltips.ansName")}
        link="https://aptos.dev/network/glossary#aptos-name-service-ans"
      />
    </Box>
  );
}
