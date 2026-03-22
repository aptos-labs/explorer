import {createIcon} from "@download/blockies";
import React, {memo} from "react";

interface IdenticonImgProps {
  address: string;
  /** When set, shown instead of a blockie (e.g. a known-address brand mark). */
  iconSrc?: string | null;
}

const imgStyle = {borderRadius: 2} as const;

const IdenticonImg = memo(function IdenticonImg({
  address,
  iconSrc,
}: IdenticonImgProps) {
  const blockieSrc = React.useMemo(() => {
    if (iconSrc) {
      return undefined;
    }
    const iconCanvas = createIcon({
      seed: address,
      size: 6,
      scale: 5,
    });
    return iconCanvas.toDataURL();
  }, [address, iconSrc]);

  const src = iconSrc || blockieSrc;
  if (!src) {
    return null;
  }

  const style = iconSrc
    ? ({...imgStyle, objectFit: "contain" as const} as const)
    : imgStyle;

  return (
    <img
      src={src}
      alt={iconSrc ? "" : "Account identicon"}
      style={style}
      loading="lazy"
    />
  );
});

export default IdenticonImg;
