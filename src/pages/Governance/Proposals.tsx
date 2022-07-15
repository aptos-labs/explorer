import React from "react";
import { useQuery } from "react-query";
import { useGlobalState } from "../../GlobalState";

export function GovernancePage() {
    const [state, _] = useGlobalState();

    // TODO - FETCH ALL PROPOSALS

    return (
        <div>Proposals</div>
    );
}