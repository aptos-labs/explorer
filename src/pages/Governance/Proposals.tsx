import React from "react";
import { useQuery } from "react-query";
import { useGlobalState } from "../../GlobalState";

export function GovernancePage() {
    const [state, _] = useGlobalState();

    // FETCH ALL PROPOSALS
    // const result = useQuery(
    //     ["proposals", state.network_value],
    //     () => getAllProposals(state.network_value),
    //     {
    //     refetchInterval: 10000,
    //     },
    // );

    return (
        <div>Proposals</div>
    );
}