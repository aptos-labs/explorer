// Copyright (c) The Diem Core Contributors
// SPDX-License-Identifier: Apache-2.0

import React, {ReactElement, useEffect, useState} from "react";
import {Result} from "ts-results";
import {ResponseError} from "../api/client";
import {CircularProgress} from "@mui/material";
import Box from "@mui/material/Box";
import {useGlobalState} from "../GlobalState";
import { ErrorBoundary } from "@sentry/react";

export type LoadingState<T, E> = Result<T, E> | { isLoading: true }

type LoadableProps<T, E> = {
  state: LoadingState<T, E>
  children: ReactElement<{ data?: T, error?: E }>
}

export function Loadable<T, E>({
                                 state,
                                 children,
                               }: LoadableProps<T, E>): React.ReactElement {

  if (!state || "isLoading" in state)
    return (
      <Box sx={{display: "flex"}}>
        <CircularProgress/>
      </Box>
    );

  if (state.err)
    return React.cloneElement(children, {error: state.val});
  else
    return React.cloneElement(children, {data: state.val});
}


interface RequestComponentProps<T, E> {
  children: ReactElement<{ data?: T, error?: E }>;
  request: (...args: any[]) => Promise<Result<T, E>>;
  refresh_interval_ms?: number;
  args?: any[];
}

export function SafeRequestComponent<T, E = ResponseError>(props: RequestComponentProps<T, E>) {
  return (
    <ErrorBoundary>
      <RequestComponent {...props}/>
    </ErrorBoundary>
  );
}

export function RequestComponent<T, E = ResponseError>({
                                                         request,
                                                         args = [],
                                                         children,
                                                         refresh_interval_ms,
                                                       }: RequestComponentProps<T, E>) {
  const [loadingState, setLoadingState] = useState<LoadingState<T, E>>({
    isLoading: true,
  });
  const [state, _] = useGlobalState();
  useEffect(() => {
    async function getResponse() {
      await request(...args).then((response) => setLoadingState(response));
    }

    let interval: NodeJS.Timer | null = null;
    if (refresh_interval_ms) {
      interval = setInterval(() => getResponse(), refresh_interval_ms);
    }

    getResponse();

    return () => {
      interval && clearInterval(interval);
    };
  }, [state, args]);

  return (
    <Loadable
      state={loadingState}
    >
      {children}
    </Loadable>
  );
}