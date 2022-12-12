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

export async function getAddressFromName(
  name: string,
  network: NetworkName,
): Promise<string | undefined> {
  const searchableName = name.endsWith(".apt") ? name.slice(0, -4) : name;
  const addressUrl = getFetchAddressUrl(network, searchableName);

  if (addressUrl === undefined) {
    return undefined;
  }

  try {
    const addressResponse = await fetch(addressUrl);
    const {address} = await addressResponse.json();

    const primaryNameUrl = getFetchNameUrl(network, address);
    const primaryNameResponse = await fetch(primaryNameUrl ?? "");
    const {name: primaryName} = await primaryNameResponse.json();

    if (primaryName === searchableName) {
      return address;
    } else {
      return undefined;
    }
  } catch {
    return undefined;
  }
}
