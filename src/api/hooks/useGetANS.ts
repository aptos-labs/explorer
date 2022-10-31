import {useEffect, useState} from "react";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

function getFetchNameUrl(network: NetworkName, address: string) {
  if (network !== "testnet" && network !== "mainnet") {
    return undefined;
  }

  return `https://www.aptosnames.com/api/${network}/v1/name/${address}`;
}

export function useGetNameFromAddress(address: string) {
  const [state, _] = useGlobalState();
  const [name, setName] = useState<string | undefined>();
  const url = getFetchNameUrl(state.network_name, address);

  useEffect(() => {
    if (url !== undefined) {
      const fetchData = async () => {
        const response = await fetch(url);
        const {name} = await response.json();
        setName(name);
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    }
  }, [address, state]);

  return name;
}

function getFetchAddressUrl(network: NetworkName, name: string) {
  if (network !== "testnet" && network !== "mainnet") {
    return undefined;
  }

  return `https://www.aptosnames.com/api/${network}/v1/address/${name}`;
}

export function useGetAddressFromName(name: string) {
  const [state, _] = useGlobalState();
  const [address, setAddress] = useState<string | undefined>();
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

export async function getAddressFromName(
  name: string,
  network: NetworkName,
): Promise<string | undefined> {
  const addressUrl = getFetchAddressUrl(network, name);
  if (addressUrl === undefined) {
    return undefined;
  }

  const addressResponse = await fetch(addressUrl);
  const {address} = await addressResponse.json();

  const primaryNameUrl = getFetchNameUrl(network, address);
  const primaryNameResponse = await fetch(primaryNameUrl ?? "");
  const {name: primaryName} = await primaryNameResponse.json();

  if (primaryName === name) {
    return address;
  } else {
    return undefined;
  }
}
