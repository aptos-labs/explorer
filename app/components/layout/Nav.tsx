import React from "react";
import {useLocation} from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
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
    location.pathname === to || location.pathname.startsWith(to + "/");

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
      sx={{
        display: {xs: "none", md: "flex"},
        alignItems: "center",
        gap: {md: 3, lg: 8},
        marginRight: {md: "2rem", lg: "3.5rem"},
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
    </Box>
  );
}
