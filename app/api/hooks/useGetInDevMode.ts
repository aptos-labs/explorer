import {useFeatureName} from "../../global-config";

export function useGetInDevMode(): boolean {
  const featureName = useFeatureName();
  return featureName === "dev";
}
