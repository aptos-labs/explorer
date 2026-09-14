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
        style={{
          color: "inherit",
          fontSize: "1rem",
          fontWeight: isActive ? 700 : undefined,
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
        display: {xs: "none", lg: "flex"},
        alignItems: "center",
        gap: {lg: 3, xl: 8},
        marginRight: {lg: "2rem", xl: "3.5rem"},
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
