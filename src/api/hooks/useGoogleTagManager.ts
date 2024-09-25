import TagManager, {DataLayerArgs} from "react-gtm-module";

type GTMParams = {
  events: object;
};

export const initGTM = ({events}: GTMParams) => {
  const tagManagerArgs = {
    gtmId: import.meta.env.REACT_APP_GTM_ID || "GTM-TPDQR928",
    events,
  };
  TagManager.initialize(tagManagerArgs);
};

export const sendToGTM = (dataLayer: DataLayerArgs): void => {
  TagManager.dataLayer(dataLayer);
};
