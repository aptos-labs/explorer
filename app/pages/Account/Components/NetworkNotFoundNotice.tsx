import {Alert, Button, Stack, Typography} from "@mui/material";
import {useLocation} from "@tanstack/react-router";
import {hiddenNetworks, type NetworkName, networks} from "../../../constants";
import {useNetworkName} from "../../../global-config";
import {translateNetworkName, useTranslation} from "../../../i18n";
import {useNavigate} from "../../../routing";

/**
 * Shown when an address has no on-chain state at all on the current network.
 * Explains that each network is a separate chain and offers one-click
 * switches to the other public networks, preserving the current path.
 */
export default function NetworkNotFoundNotice() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentNetwork = useNetworkName();
  const networkLabel = translateNetworkName(currentNetwork, t);

  // Same visibility rule as the header NetworkSelect: public networks only,
  // no localnet (requires a locally running node).
  const otherNetworks = (Object.keys(networks) as NetworkName[]).filter(
    (network) =>
      network !== currentNetwork &&
      !hiddenNetworks.includes(network) &&
      network !== "local",
  );

  const switchTo = (network: NetworkName) => {
    // Inline `?network=` wins over the navigate wrapper's merge, so this
    // genuinely switches networks instead of re-asserting the current one.
    navigate({
      to: `${location.pathname}?network=${network}`,
    });
  };

  return (
    <Alert severity="info" icon={false} sx={{mt: 1}}>
      <Stack spacing={1.5}>
        <div>
          <Typography variant="subtitle1" sx={{fontWeight: 600}}>
            {t("pages.account.notFoundOnNetworkTitle", {network: networkLabel})}
          </Typography>
          <Typography variant="body2" sx={{color: "text.secondary"}}>
            {t("pages.account.notFoundOnNetworkBody", {network: networkLabel})}
          </Typography>
        </div>
        {otherNetworks.length > 0 && (
          <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
            <Typography variant="body2" sx={{color: "text.secondary"}}>
              {t("pages.account.notFoundOnNetworkTry")}
            </Typography>
            {otherNetworks.map((network) => (
              <Button
                key={network}
                size="small"
                variant="outlined"
                onClick={() => switchTo(network)}
              >
                {translateNetworkName(network, t)}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>
    </Alert>
  );
}
