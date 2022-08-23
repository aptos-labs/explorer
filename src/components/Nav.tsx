import React, {useState} from "react";

import {NavLink, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {Menu, MenuItem} from "@mui/material";
import Fade from "@mui/material/Fade";

export default function Nav() {
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
        display: {xs: "none", sm: "flex"},
        alignItems: "center",
        gap: {sm: 2, md: 4, lg: 8},
        marginRight: {sm: "1rem", md: "2rem", lg: "3.5rem"},
      }}
    >
      <Button
        variant="nav"
        component={NavLink}
        to="/transactions"
        title="View all Transactions"
        sx={{
          color: "inherit",
          fontSize: {sm: ".875rem", md: "1rem"},
        }}
      >
        Transactions
      </Button>
      <Button
        variant="nav"
        onClick={handleGovernanceClick}
        title="Aptos Governance"
        sx={{
          color: "inherit",
          fontSize: {sm: ".875rem", md: "1rem"},
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
        <MenuItem onClick={() => handleCloseAndNavigate("/proposals/stake")}>
          Stake
        </MenuItem>
      </Menu>
    </Box>
  );
}
