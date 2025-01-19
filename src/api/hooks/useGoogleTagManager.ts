import TagManager, {DataLayerArgs} from "react-gtm-module";

type GTMParams = {
  events: object;
};

export const initGTM = ({events}: GTMParams) => {
  const tagManagerArgs = {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-ND9VTF4",
    events,
  };
  TagManager.initialize(tagManagerArgs);
};

export const sendToGTM = (dataLayer: DataLayerArgs): void => {
  TagManager.dataLayer(dataLayer);
};
