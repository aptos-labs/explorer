import {createIcon} from "@download/blockies";
import React, {memo} from "react";

interface IdenticonImgProps {
  address: string;
  /** When set, shown instead of a blockie (e.g. a known-address brand mark). */
  iconSrc?: string | null;
}

/** Must match `createIcon` `size` × `scale` so blockies and overrides share one box. */
const BLOCKIE_SIZE = 6;
const BLOCKIE_SCALE = 5;
const IDENTICON_PX = BLOCKIE_SIZE * BLOCKIE_SCALE;

const baseImgStyle: React.CSSProperties = {
  width: IDENTICON_PX,
  height: IDENTICON_PX,
  borderRadius: 2,
  display: "block",
  flexShrink: 0,
};

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
      size: BLOCKIE_SIZE,
      scale: BLOCKIE_SCALE,
    });
    return iconCanvas.toDataURL();
  }, [address, iconSrc]);

  const src = iconSrc || blockieSrc;
  if (!src) {
    return null;
  }

  const style: React.CSSProperties = iconSrc
    ? {...baseImgStyle, objectFit: "contain"}
    : baseImgStyle;

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
