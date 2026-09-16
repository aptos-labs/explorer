import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {useLocation} from "@tanstack/react-router";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import {useTranslation} from "../../i18n";
import {Link} from "../../routing";

function NavButton({
  to,
  title,
  label,
}: {
  to: string;
  title: string;
  label: string;
}) {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link to={to} style={{textDecoration: "none", color: "inherit"}}>
      <Button
        variant="nav"
        title={title}
        sx={{
          color: "inherit",
          fontSize: {lg: "0.9375rem", xl: "1rem"},
          fontWeight: isActive ? 700 : undefined,
          minWidth: 0,
          px: {lg: 0.75, xl: 1.25},
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Button>
    </Link>
  );
}

export default function Nav() {
  const inMainnet = useGetInMainnet();
  const {t} = useTranslation();

  return (
    <Box
      component="nav"
      aria-label={t("chrome.navAriaLabel")}
      sx={{
        display: "flex",
        alignItems: "center",
        // Keep the lg+ toolbar's min-content under the viewport width. The
        // previous xl gap (64px) made the document ~1700px wide at 1536px.
        gap: {lg: 0.75, xl: 2},
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <NavButton
        to="/transactions"
        title={t("chrome.nav.transactionsTitle")}
        label={t("chrome.nav.transactions")}
      />
      {inMainnet && (
        <NavButton
          to="/analytics"
          title={t("chrome.nav.analyticsTitle")}
          label={t("chrome.nav.analytics")}
        />
      )}
      <NavButton
        to="/validators"
        title={t("chrome.nav.validatorsTitle")}
        label={t("chrome.nav.validators")}
      />
      <NavButton
        to="/blocks"
        title={t("chrome.nav.blocksTitle")}
        label={t("chrome.nav.blocks")}
      />
      <NavButton
        to="/coins"
        title={t("chrome.nav.coinsTitle")}
        label={t("chrome.nav.coins")}
      />
      <NavButton
        to="/releases"
        title={t("chrome.nav.releasesTitle")}
        label={t("chrome.nav.releases")}
      />
      <NavButton
        to="/run-script"
        title={t("chrome.nav.runScriptTitle")}
        label={t("chrome.nav.runScript")}
      />
    </Box>
  );
}
