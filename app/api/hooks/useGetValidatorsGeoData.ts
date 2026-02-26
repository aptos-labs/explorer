import {useMemo} from "react";
import {type GeoData, useGetValidators} from "./useGetValidators";

export type ValidatorGeoMetric = {
  nodeCount: number;
  countryCount: number;
  cityCount: number;
};

export type CityBreakdown = {
  name: string;
  count: number;
};

export interface ValidatorGeoGroup {
  city: string;
  country: string;
  lat: number;
  lng: number;
  nodes: GeoData[];
  /** Present only in country-level groups */
  cities?: CityBreakdown[];
}

export function useGetValidatorSetGeoData() {
  const {validators} = useGetValidators();

  const {cityGroups, countryGroups, validatorGeoMetric} = useMemo(() => {
    // -- City-level groups --
    const cityMap = new Map<string, ValidatorGeoGroup>();
    const countries = new Set<string>();

    for (const validatorData of validators) {
      const geoData = validatorData.location_stats;
      if (!geoData?.country || !geoData?.city) {
        continue;
      }

      countries.add(geoData.country);
      const key = `${geoData.city}|${geoData.country}`;

      const existing = cityMap.get(key);
      if (existing) {
        existing.nodes.push(geoData);
      } else {
        cityMap.set(key, {
          city: geoData.city,
          country: geoData.country,
          lat: 0,
          lng: 0,
          nodes: [geoData],
        });
      }
    }

    const cityGroups = Array.from(cityMap.values());
    for (const group of cityGroups) {
      const count = group.nodes.length;
      let latSum = 0;
      let lngSum = 0;
      for (const node of group.nodes) {
        latSum += node.latitude;
        lngSum += node.longitude;
      }
      group.lat = latSum / count;
      group.lng = lngSum / count;
    }

    // -- Country-level groups (aggregated from city groups) --
    const countryMap = new Map<string, ValidatorGeoGroup>();

    for (const cg of cityGroups) {
      const existing = countryMap.get(cg.country);
      if (existing) {
        existing.nodes.push(...cg.nodes);
        existing.cities!.push({name: cg.city, count: cg.nodes.length});
      } else {
        countryMap.set(cg.country, {
          city: "",
          country: cg.country,
          lat: 0,
          lng: 0,
          nodes: [...cg.nodes],
          cities: [{name: cg.city, count: cg.nodes.length}],
        });
      }
    }

    const countryGroups = Array.from(countryMap.values());
    for (const group of countryGroups) {
      const count = group.nodes.length;
      let latSum = 0;
      let lngSum = 0;
      for (const node of group.nodes) {
        latSum += node.latitude;
        lngSum += node.longitude;
      }
      group.lat = latSum / count;
      group.lng = lngSum / count;
      group.cities!.sort((a, b) => b.count - a.count);
    }

    const validatorGeoMetric: ValidatorGeoMetric = {
      nodeCount: validators.length,
      countryCount: countries.size,
      cityCount: cityGroups.length,
    };

    return {cityGroups, countryGroups, validatorGeoMetric};
  }, [validators]);

  return {cityGroups, countryGroups, validatorGeoMetric};
}
