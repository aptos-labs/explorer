import {useGlobalState} from "../../GlobalState";
import {useEffect, useMemo, useState} from "react";

const MAINNET_VALIDATORS_GEO_DATA_URL =
  "https://aptos-analytics-data-mainnet.s3.amazonaws.com/validator_location_stats.json";

export interface GeoData {
  peer_id: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region: string;
  epoch: number;
}

function useGetGeoData() {
  const [state, _] = useGlobalState();
  const [geoDatas, setGeoDatas] = useState<GeoData[]>([]);

  useEffect(() => {
    if (state.network_name === "mainnet") {
      const fetchData = async () => {
        const response = await fetch(MAINNET_VALIDATORS_GEO_DATA_URL);
        const data = await response.json();
        setGeoDatas(data);
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    } else {
      setGeoDatas([]);
    }
  }, [state]);

  return {geoDatas};
}

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
  const {geoDatas} = useGetGeoData();
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
    const groups: ValidatorGeoGroup[] = geoDatas.reduce(
      (groups: ValidatorGeoGroup[], geoData: GeoData) => {
        const country = geoData.country;
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
      nodeCount: geoDatas.length,
      countryCount: groups.length,
      cityCount: totalCityCount,
    });
  }, [geoDatas]);

  return {validatorGeoGroups, validatorGeoMetric};
}
