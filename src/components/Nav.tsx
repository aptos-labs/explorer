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
    <Button
      variant="nav"
      component={NavLink}
      to={to}
      title={title}
      sx={{
        color: "inherit",
        fontSize: "1rem",
      }}
    >
      {label}
    </Button>
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
          <NavButton to="/blocks" title="View All Blocks" label="Blocks" />
          <NavButton
            to="/Validators"
            title="View All Validators"
            label="Validators"
          />
          <NavButton to="/tokens" title="View Top Tokens" label="Tokens" />
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
