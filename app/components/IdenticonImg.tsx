import React, {memo} from "react";
import {createIcon} from "@download/blockies";

interface IdenticonImgProps {
  address: string;
}

// Static style extracted to avoid recreation
const imgStyle = {borderRadius: 2} as const;

// Memoized to prevent re-renders when parent updates with same address
const IdenticonImg = memo(function IdenticonImg({address}: IdenticonImgProps) {
  // Memoize icon canvas creation to avoid regenerating on every render
  const iconCanvas = React.useMemo(
    () =>
      createIcon({
        seed: address,
        size: 6,
        scale: 5,
      }),
    [address],
  );

  // Memoize canvas generation to avoid regenerating on every render
  const iconDataURL = React.useMemo(() => iconCanvas.toDataURL(), [iconCanvas]);

  // Return an img element with the data URL as the src
  return (
    <img
      src={iconDataURL}
      alt={`Account identicon for ${address.slice(0, 10)}...`}
      style={imgStyle}
      loading="lazy"
    />
  );
});

export default IdenticonImg;
