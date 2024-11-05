import {useMemo, useState} from "react";
import {GeoData, ValidatorData, useGetValidators} from "./useGetValidators";

export type ValidatorGeoMetric = {
  nodeCount: number;
  countryCount: number;
  cityCount: number;
};

export type City = {
  name: string;
  count: number;
};

export interface ValidatorGeoGroup {
  country: string;
  countryLat: number;
  countryLng: number;
  nodes: GeoData[];
  cities: City[];
}

export function useGetValidatorSetGeoData() {
  const {validators} = useGetValidators();
  const [validatorGeoGroups, setValidatorGeoGroups] = useState<
    ValidatorGeoGroup[]
  >([]);
  const [validatorGeoMetric, setValidatorGeoMetric] =
    useState<ValidatorGeoMetric>({
      nodeCount: 0,
      countryCount: 0,
      cityCount: 0,
    });

  useMemo(() => {
    const groups: ValidatorGeoGroup[] = validators.reduce(
      (groups: ValidatorGeoGroup[], validatorData: ValidatorData) => {
        const geoData = validatorData.location_stats;
        const country = geoData?.country;
        if (!country) {
          return groups;
        }

        const existingGroup = groups.find((group) => group.country === country);
        if (existingGroup) {
          existingGroup.nodes.push(geoData);
        } else {
          const newGroup = {
            country: country,
            countryLat: 0,
            countryLng: 0,
            nodes: [geoData],
            cities: [],
          };
          groups.push(newGroup);
        }
        return groups;
      },
      [],
    );

    let totalCityCount = 0;

    groups.map((group: ValidatorGeoGroup) => {
      const count = group.nodes.length;

      // process lat and lng
      const latitudeSum = group.nodes.reduce((sum: number, node: GeoData) => {
        return sum + node.latitude;
      }, 0);
      const longitudeSum = group.nodes.reduce((sum: number, node: GeoData) => {
        return sum + node.longitude;
      }, 0);
      group.countryLat = latitudeSum / count;
      group.countryLng = longitudeSum / count;

      // process cities
      const cities = group.cities;
      group.nodes.map((node: GeoData) => {
        const city = node.city;
        const existingCity = cities.find(
          (nodeCity: City) => nodeCity.name === city,
        );
        if (existingCity) {
          existingCity.count++;
        } else {
          const newCity = {name: city, count: 1};
          cities.push(newCity);
        }
      });
      cities.sort((city1: City, city2: City) => city2.count - city1.count);

      totalCityCount += cities.length;
    });

    setValidatorGeoGroups(groups);
    setValidatorGeoMetric({
      nodeCount: validators.length,
      countryCount: groups.length,
      cityCount: totalCityCount,
    });
  }, [validators]);

  return {validatorGeoGroups, validatorGeoMetric};
}
