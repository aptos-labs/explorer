import {useEffect, useState} from "react";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

function getFetchNameUrl(network: NetworkName, address: string) {
  switch (network) {
    case "mainnet":
      return `https://www.aptosnames.com/api/mainnet/v1/name/${address}`;
    case "testnet":
      return `https://www.aptosnames.com/api/testnet/v1/name/${address}`;
    default:
      return undefined;
  }
}

export function useGetNameFromAddress(address: string) {
  const [state, _] = useGlobalState();
  const [name, setName] = useState<string>();
  const url = getFetchNameUrl(state.network_name, address);

  useEffect(() => {
    if (url !== undefined) {
      const fetchData = async () => {
        const response = await fetch(url);
        const {name} = await response.json();
        setName(name);
      };

      fetchData();
    }
  }, [address, state]);

  return name;
}

function getFetchAddressUrl(network: NetworkName, name: string) {
  switch (network) {
    case "mainnet":
      return `https://www.aptosnames.com/api/mainnet/v1/address/${name}`;
    case "testnet":
      return `https://www.aptosnames.com/api/testnet/v1/address/${name}`;
    default:
      return undefined;
  }
}

export function useGetAddressFromName(name: string) {
  const [state, _] = useGlobalState();
  const [address, setAddress] = useState<string>();
  const url = getFetchAddressUrl(state.network_name, name);

  useEffect(() => {
    if (url !== undefined) {
      const fetchData = async () => {
        const response = await fetch(url);
        const {address} = await response.json();
        setAddress(address);
      };

      fetchData();
    }
  }, [name, state]);

  return address;
}
