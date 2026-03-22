import {createIcon} from "@download/blockies";
import type React from "react";
import {memo, useEffect, useMemo, useState} from "react";

interface IdenticonImgProps {
  address: string;
  /** When set, shown instead of a blockie (e.g. a known-address brand mark). */
  iconSrc?: string | null;
  /** Short text overlaid at the top of a custom icon (e.g. `0x1` for framework). */
  iconBadge?: string | null;
  /**
   * Rendered width/height in CSS pixels. Defaults to the blockie canvas size
   * so layout matches generated identicons; use a smaller value when the parent
   * reserves a tighter box (e.g. mobile tables).
   */
  sizePx?: number;
}

/** Must match `createIcon` `size` × `scale` so blockies and overrides share one default box. */
const BLOCKIE_SIZE = 6;
const BLOCKIE_SCALE = 5;
const IDENTICON_PX = BLOCKIE_SIZE * BLOCKIE_SCALE;

const IdenticonImg = memo(function IdenticonImg({
  address,
  iconSrc,
  iconBadge,
  sizePx = IDENTICON_PX,
}: IdenticonImgProps) {
  const [iconErrored, setIconErrored] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: props must reset load-error state when identity changes (Biome misreads memo props as outer scope)
  useEffect(() => {
    setIconErrored(false);
  }, [address, iconSrc]);

  const useOverride = Boolean(iconSrc) && !iconErrored;

  const blockieSrc = useMemo(() => {
    if (useOverride) {
      return undefined;
    }
    const iconCanvas = createIcon({
      seed: address,
      size: BLOCKIE_SIZE,
      scale: BLOCKIE_SCALE,
    });
    return iconCanvas.toDataURL();
  }, [address, useOverride]);

  const src = (useOverride && iconSrc) || blockieSrc;
  if (!src) {
    return null;
  }

  const boxStyle: React.CSSProperties = {
    width: sizePx,
    height: sizePx,
    borderRadius: 2,
    display: "block",
    flexShrink: 0,
  };

  const style: React.CSSProperties = useOverride
    ? {...boxStyle, objectFit: "contain"}
    : boxStyle;

  const showBadge = Boolean(
    iconBadge && useOverride && iconSrc && !iconErrored,
  );

  const badgeFontPx = Math.max(8, Math.round(sizePx * 0.24));

  const img = (
    <img
      src={src}
      alt={useOverride ? "" : "Account identicon"}
      style={style}
      loading="lazy"
      onError={() => {
        if (useOverride) {
          setIconErrored(true);
        }
      }}
    />
  );

  if (!showBadge) {
    return img;
  }

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: sizePx,
        height: sizePx,
        flexShrink: 0,
        verticalAlign: "middle",
      }}
    >
      {img}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1,
          textAlign: "center",
          fontSize: badgeFontPx,
          fontWeight: 700,
          lineHeight: 1,
          color: "#fff",
          textShadow:
            "0 0 2px #000, 0 1px 2px rgba(0,0,0,0.95), 0 -1px 1px rgba(0,0,0,0.5)",
          pointerEvents: "none",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {iconBadge}
      </span>
    </span>
  );
});

export default IdenticonImg;
