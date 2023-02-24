import {useEffect, useState} from "react";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

function getFetchNameUrl(
  network: NetworkName,
  address: string,
  isPrimary: boolean,
) {
  if (network !== "testnet" && network !== "mainnet") {
    return undefined;
  }

  return isPrimary
    ? `https://www.aptosnames.com/api/${network}/v1/primary-name/${address}`
    : `https://www.aptosnames.com/api/${network}/v1/name/${address}`;
}

export function useGetNameFromAddress(address: string) {
  const [state, _] = useGlobalState();
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    const primaryNameUrl = getFetchNameUrl(state.network_name, address, true);
    if (primaryNameUrl !== undefined) {
      const fetchData = async () => {
        const primaryNameResponse = await fetch(primaryNameUrl);
        const {name: primaryName} = await primaryNameResponse.json();

        if (primaryName) {
          setName(primaryName);
        } else {
          const nameUrl =
            getFetchNameUrl(state.network_name, address, false) ?? "";
          const nameResponse = await fetch(nameUrl);
          const {name} = await nameResponse.json();
          setName(name);
        }
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
): Promise<{address: string | undefined; primaryName: string | undefined}> {
  const searchableName = name.endsWith(".apt") ? name.slice(0, -4) : name;
  const addressUrl = getFetchAddressUrl(network, searchableName);

  const notFoundResult = {address: undefined, primaryName: undefined};
  if (addressUrl === undefined) {
    return notFoundResult;
  }

  try {
    const addressResponse = await fetch(addressUrl);
    const {address} = await addressResponse.json();

    const primaryNameUrl = getFetchNameUrl(network, address, true);
    const primaryNameResponse = await fetch(primaryNameUrl ?? "");
    const {name: primaryName} = await primaryNameResponse.json();

    return {address: address, primaryName: primaryName};
  } catch {
    return notFoundResult;
  }
}
