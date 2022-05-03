import fetch from "isomorphic-fetch";
import {Configuration, BaseAPI} from "../api_client/";
import {defaultNetwork} from "../constants";
import {Err, Ok, Result} from "ts-results";

export enum ResponseErrorType {
  NOT_FOUND = "Not found",
  UNHANDLED = "Unhandled",
}

export type ResponseError =
  | {type: ResponseErrorType.NOT_FOUND; message?: string}
  | {type: ResponseErrorType.UNHANDLED; message: string};

export async function withResponseError<T>(promise: Promise<T>): Promise<T> {
  return await promise.catch((error) => {
    console.error("ERROR!", error, typeof error);
    if (typeof error == "object" && "status" in error) {
      // This is a request!
      error = error as Response;
      if (error.status === 404) {
        throw {type: ResponseErrorType.NOT_FOUND};
      }
    }

    throw {
      type: ResponseErrorType.UNHANDLED,
      message: error.toString(),
    };
  });
}

export function configureClient<T extends BaseAPI>(
  klass: {new (c: Configuration): T},
  node_url?: string,
): T {
  const configuration = new Configuration({
    basePath: node_url || defaultNetwork,
    fetchApi: fetch,
  });
  return new klass(configuration);
}
