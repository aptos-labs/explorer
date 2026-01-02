import React from "react";
import {createIcon} from "@download/blockies";

interface IdenticonImgProps {
  address: string;
}

const IdenticonImg: React.FunctionComponent<IdenticonImgProps> = ({
  address,
}) => {
  /*const {data: profile} = useGetProfile(address);
  if (profile?.avatar_url) {
    // TODO: Only add this back once we can get caching and error handling of bad URLs working
    return (
      <img
        src={profile.avatar_url}
        width={30}
        height={30}
        alt="Profile Avatar"
        style={{borderRadius: 2}}
      />
    );
  }*/

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
      alt="Identicon"
      style={{borderRadius: 2}}
      loading="lazy"
    />
  );
};

export default IdenticonImg;
