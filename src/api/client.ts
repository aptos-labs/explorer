import fetch from "isomorphic-fetch";
import {Configuration, BaseAPI} from "../api_client/";
import {testnet_url} from "../constants";
import {Err, Ok, Result} from "ts-results";

export enum ResponseErrorType {
  NOT_FOUND = "Not found",
  UNHANDLED = "Unhandled",
}

export type ResponseError =
  | { type: ResponseErrorType.NOT_FOUND; message?: string }
  | { type: ResponseErrorType.UNHANDLED; message: string }

export async function toResult<T>(
  promise: Promise<T>
): Promise<Result<T, ResponseError>> {
  return await promise
    .then((response) => Ok(response))
    .catch((error) => {
        console.error("ERROR!", error, typeof error);
        if (typeof error == "object" && "status" in error) {
          // This is a request!
          error = error as Response;
          if (error.status === 404) {
            return Err({type: ResponseErrorType.NOT_FOUND});
          }
        }

        return Err({type: ResponseErrorType.UNHANDLED, message: error.toString()});
      }
    );
}

export function configureClient<T extends BaseAPI>(klass: { new(c: Configuration): T }, node_url?: string): T {
  const configuration = new Configuration({
    basePath: node_url || testnet_url,
    fetchApi: fetch
  });
  return new klass(configuration);
}



