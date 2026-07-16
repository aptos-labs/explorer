import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {useLocation} from "@tanstack/react-router";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
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

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        display: {xs: "none", lg: "flex"},
        alignItems: "center",
        gap: {lg: 3, xl: 8},
        marginRight: {lg: "2rem", xl: "3.5rem"},
      }}
    >
      <NavButton
        to="/transactions"
        title="View All Transactions"
        label="Transactions"
      />
      {inMainnet && (
        <NavButton
          to="/analytics"
          title="View Network Analytics"
          label="Analytics"
        />
      )}
      <NavButton
        to="/validators"
        title="View All Validators"
        label="Validators"
      />
      <NavButton to="/blocks" title="View Latest Blocks" label="Blocks" />
      <NavButton
        to="/coins"
        title="View Coins & Fungible Assets"
        label="Coins"
      />
      <NavButton
        to="/releases"
        title="View Network Deployments, AIPs, and SDK & Tool Releases"
        label="Releases"
      />
      <NavButton
        to="/run-script"
        title="Build, Simulate, and Execute a Move Script (Advanced)"
        label="Run Script"
      />
    </Box>
  );
}
