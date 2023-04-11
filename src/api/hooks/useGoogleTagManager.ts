import TagManager from "react-gtm-module";

type GTMParams = {
  events: object;
};

export const initGTM = ({events}: GTMParams) => {
  const tagManagerArgs = {
    gtmId: process.env.REACT_APP_GTM_ID || "GTM-ND9VTF4",
    events,
  };
  TagManager.initialize(tagManagerArgs);
};

export const sendToGTM = (dataLayer: Object): void => {
  TagManager.dataLayer(dataLayer);
};
