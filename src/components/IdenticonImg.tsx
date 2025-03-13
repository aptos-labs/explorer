import {createIcon} from "@download/blockies";

interface IdenticonImgProps {
  address: string;
}

function addressToColor(address:string) {
  if (address.startsWith('0x')) {
    address = address.slice(2);
  }
  // Take the first 6 characters for the color
  const color = `${address.slice(0, 6)}`;
  return color;
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

  // const iconCanvas = createIcon({
  //   seed: address,
  //   size: 2,
  //   scale: 150,
  //   bgColor: addressToColor(address),
  // });

  // Convert canvas to data URL
  //const iconDataURL = iconCanvas.toDataURL();

  // Return an img element with the data URL as the src
  return <></> //<img src={iconDataURL} alt="Identicon" style={{borderRadius: 0, width: 30, height: 30}} />;
};

export default IdenticonImg;
