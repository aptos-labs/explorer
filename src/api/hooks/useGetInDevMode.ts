import {useFeatureName} from "../../global-config/GlobalConfig";

export function useGetInDevMode(): boolean {
  const featureName = useFeatureName();
  return featureName && featureName === "dev";
}
