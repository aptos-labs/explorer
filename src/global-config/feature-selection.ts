import {useSearchParams} from "react-router-dom";
import {
  FeatureName,
  defaultFeatureName,
  features,
  isValidFeatureName,
} from "../constants";
import {useCallback, useState} from "react";

export function getSelectedFeatureFromLocalStorage(): FeatureName {
  let selected_feature = localStorage.getItem("selected_feature");
  if (selected_feature) {
    selected_feature = selected_feature.toLowerCase();
    if (selected_feature in features) {
      return selected_feature as FeatureName;
    }
  }
  return defaultFeatureName;
}

// This is a custom hook that allows us to select a feature
// The feature is stored in local storage across sessions and also in the url as a query param during the session lifetime.
// don't use this hook directly in components, rather use: const [useGlobalState, {selectFeature}] = useGlobalState();
export function useFeatureSelector() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFeature, setSelectedFeature] = useState(() => {
    const featureQueryParam = searchParams.get("feature");
    if (
      featureQueryParam &&
      isValidFeatureName(featureQueryParam as FeatureName)
    ) {
      return featureQueryParam as FeatureName;
    }
    return getSelectedFeatureFromLocalStorage();
  });

  const selectFeature = useCallback(
    (feature_name: FeatureName) => {
      if (!isValidFeatureName(feature_name)) return;
      localStorage.setItem("selected_feature", feature_name);
      // only show the "feature" param in the url when it's not "prod"
      // we don't want the users to know the existence of the "feature" param
      if (feature_name === defaultFeatureName) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("feature");
          return newParams;
        });
      } else {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("feature", feature_name);
          return newParams;
        });
      }
      setSelectedFeature(feature_name);
    },
    [setSearchParams],
  );

  return [selectedFeature, selectFeature] as const;
}
