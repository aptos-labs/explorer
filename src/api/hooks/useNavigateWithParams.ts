import {
  createSearchParams,
  generatePath,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {defaultNetworkName} from "../../constants";

export function useNavigateWithParams() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const networkName = searchParams.get("network") || defaultNetworkName;

  const navigateWithParams = (url: string) => {
    const params = {network: networkName};
    const path = generatePath(":url?:queryString", {
      url,
      queryString: createSearchParams(params).toString(),
    });
    navigate(path);
  };

  return navigateWithParams;
}
