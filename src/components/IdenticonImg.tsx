import { createAvatar } from '@dicebear/core';
import { notionistsNeutral } from '@dicebear/collection';

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
  const iconCanvas = createAvatar(notionistsNeutral,{
    seed: address,
    size: 24,
    scale: 150,
    backgroundColor: [`${addressToColor(address)}`]
  });

  // Convert canvas to data URL
  const iconDataURL = iconCanvas.toDataUri();

  // Return an img element with the data URL as the src
  return <img src={iconDataURL} alt="Identicon" style={{borderRadius: 0}} />;
};

export default IdenticonImg;
