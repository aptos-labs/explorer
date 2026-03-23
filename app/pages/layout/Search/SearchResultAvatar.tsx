import {Box} from "@mui/material";
import type React from "react";
import IdenticonImg from "../../../components/IdenticonImg";
import {useKnownAddressBranding} from "../../../data/hooks";
import {tryStandardizeAddress} from "../../../utils";

type SearchResultAvatarProps = {
  image?: string;
  identiconKey?: string;
  sizePx?: number;
};

/**
 * Leading visual for search rows: token/coin logo when present, otherwise a
 * blockie or known-address brand mark when `identiconKey` is set.
 */
export function SearchResultAvatar({
  image,
  identiconKey,
  sizePx = 24,
}: SearchResultAvatarProps): React.JSX.Element | null {
  const std = identiconKey ? tryStandardizeAddress(identiconKey) : undefined;
  const branding = useKnownAddressBranding(std);
  const identiconSeed = std ?? identiconKey;

  if (image) {
    return (
      <Box
        component="img"
        src={image}
        alt=""
        sx={{
          width: sizePx,
          height: sizePx,
          borderRadius: "50%",
          flexShrink: 0,
          objectFit: "cover",
        }}
        loading="lazy"
      />
    );
  }

  if (identiconSeed) {
    return (
      <IdenticonImg
        address={identiconSeed}
        iconSrc={branding?.icon}
        iconBadge={branding?.iconBadge}
        sizePx={sizePx}
      />
    );
  }

  return null;
}
