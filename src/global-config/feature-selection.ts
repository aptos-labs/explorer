import {useSearchParams} from "react-router-dom";
import {
  FeatureName,
  defaultFeatureName,
  features,
  isValidFeatureName,
} from "../constants";
import {useEffect, useState} from "react";
import omit from "lodash/omit";

export function safeGetSelectedFeatureName(): FeatureName {
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
export function useFeatureSelector() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFeature, setActiveFeatureState] = useState(
    safeGetSelectedFeatureName,
  );

  const featureQueryParam = searchParams.get("feature");

  useEffect(() => {
    if (featureQueryParam) {
      selectFeature(featureQueryParam as FeatureName);
    }
  }, [featureQueryParam]);

  function selectFeature(feature_name: FeatureName) {
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
    setActiveFeatureState(feature_name);
  }

  return [selectedFeature, selectFeature] as const;
}
