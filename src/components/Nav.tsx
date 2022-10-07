import React, {useState} from "react";

import {NavLink, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {Menu, MenuItem} from "@mui/material";
import Fade from "@mui/material/Fade";
import {useGetInDevMode} from "../api/hooks/useGetInDevMode";

function NavButton({
  to,
  title,
  label,
}: {
  to: string;
  title: string;
  label: string;
}) {
  return (
    <NavLink to={to} style={{textDecoration: "none", color: "inherit"}}>
      {({isActive}) => (
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
      )}
    </NavLink>
  );
}

export default function Nav() {
  const inDev = useGetInDevMode();
  const [governanceMenuEl, setGovernanceMenuEl] = useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();
  const open = Boolean(governanceMenuEl);

  const handleGovernanceClick = (event: React.MouseEvent<HTMLElement>) => {
    setGovernanceMenuEl(event.currentTarget);
  };
  const handleCloseAndNavigate = (to: string) => {
    setGovernanceMenuEl(null);
    navigate(to);
  };

  const handleClose = () => {
    setGovernanceMenuEl(null);
  };

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
      {inDev && (
        <>
          <NavButton to="/blocks" title="View Latest Blocks" label="Blocks" />
          <NavButton
            to="/Validators"
            title="View All Validators"
            label="Validators"
          />
        </>
      )}
      {!inDev && (
        <>
          <Button
            variant="nav"
            onClick={handleGovernanceClick}
            title="Aptos Governance"
            sx={{
              color: "inherit",
              fontSize: "1rem",
            }}
          >
            Governance
          </Button>
          <Menu
            open={open}
            onClose={handleClose}
            anchorEl={governanceMenuEl}
            TransitionComponent={Fade}
            aria-controls={open ? "fade-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <MenuItem onClick={() => handleCloseAndNavigate("/proposals")}>
              Proposals
            </MenuItem>
            <MenuItem
              onClick={() => handleCloseAndNavigate("/proposals/staking")}
            >
              Staking
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}
