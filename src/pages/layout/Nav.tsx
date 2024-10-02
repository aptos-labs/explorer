import React from "react";
import {NavLink} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import {useAugmentToWithGlobalSearchParams} from "../../routing";
import {useGetInTestnet} from "../../api/hooks/useGetInTestnet";

function NavButton({
  to,
  title,
  label,
}: {
  to: string;
  title: string;
  label: string;
}) {
  const augumentToWithGlobalSearchParams = useAugmentToWithGlobalSearchParams();

  return (
    <NavLink
      to={augumentToWithGlobalSearchParams(to)}
      style={{textDecoration: "none", color: "inherit"}}
    >
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
  const inMainnet = useGetInMainnet();
  const inTestnet = useGetInTestnet();

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
      {(inMainnet || inTestnet) && (
        <NavButton
          to="/analytics"
          title="View Network Analytics"
          label="Analytics"
        />
      )}
      {inMainnet && (
        <>
          <NavButton
            to="/validators"
            title="View All Validators"
            label="Validators"
          />
        </>
      )}

      <NavButton to="/blocks" title="View Latest Blocks" label="Blocks" />
    </Box>
  );
}
