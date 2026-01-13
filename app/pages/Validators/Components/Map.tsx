/**
 * SSR placeholder for the Map component.
 *
 * This file exists for SSR compatibility. The actual map implementation
 * with react-simple-maps is in Map.client.tsx, which is loaded via
 * dynamic import in ValidatorsMap.tsx on the client side only.
 *
 * This placeholder returns null and is not used at runtime since
 * ValidatorsMap.tsx imports Map.client.tsx directly via dynamic import.
 */
import type {ValidatorGeoGroup} from "../../../api/hooks/useGetValidatorsGeoData";

type MapProps = {
  validatorGeoGroups: ValidatorGeoGroup[];
};

// SSR placeholder - not used at runtime.
// ValidatorsMap.tsx dynamically imports Map.client.tsx on the client.
export default function Map(_props: MapProps) {
  return null;
}
