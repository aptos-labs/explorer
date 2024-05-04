import React from "react";
import {createIcon} from "@download/blockies";

interface IdenticonImgProps {
  address: string;
}

const IdenticonImg: React.FunctionComponent<IdenticonImgProps> = ({
  address,
}) => {
  const iconCanvas = createIcon({
    seed: address,
    size: 6,
    scale: 5,
  });

  // Convert canvas to data URL
  const iconDataURL = iconCanvas.toDataURL();

  // Return an img element with the data URL as the src
  return <img src={iconDataURL} alt="Identicon" style={{borderRadius: 2}} />;
};

export default IdenticonImg;
