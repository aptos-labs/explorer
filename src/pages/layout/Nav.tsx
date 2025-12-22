import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { NavLink } from "react-router-dom";
import { useGetInMainnet } from "../../api/hooks/useGetInMainnet";
import { useGetInTestnet } from "../../api/hooks/useGetInTestnet";
import { useAugmentToWithGlobalSearchParams } from "../../routing";
import NetworkSelect from "./NetworkSelect";

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
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {({ isActive }) => (
        <Button
          variant="nav"
          title={title}
          style={{
            color: "inherit",
            fontSize: "0.875rem",
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

  const mainnetShowAnalytics = false;

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        gap: { md: 3, lg: 0 },
        marginRight: { md: "0rem", lg: "0rem" },
      }}
    >
      <NavButton
        to="/transactions"
        title="View All Transactions"
        label="Transactions"
      />

      {((inMainnet && mainnetShowAnalytics) || inTestnet) && (
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
      <NetworkSelect />
    </Box>
  );
}
