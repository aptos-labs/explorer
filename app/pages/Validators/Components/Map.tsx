/**
 * Server-safe Map component wrapper.
 *
 * This file re-exports the client-only Map component for dynamic imports.
 * The actual react-simple-maps import is in Map.client.tsx.
 *
 * During SSR, this module is aliased to return null (see vite.config.ts).
 * On the client, it dynamically loads the real Map component.
 */
import type {ValidatorGeoGroup} from "../../../api/hooks/useGetValidatorsGeoData";

type MapProps = {
  validatorGeoGroups: ValidatorGeoGroup[];
};

// This component is only used during SSR as a placeholder.
// The actual Map component is loaded via dynamic import in ValidatorsMap.tsx
// which imports Map.client.tsx directly.
export default function Map(_props: MapProps) {
  // Return null during SSR - the real component is loaded client-side
  return null;
}
