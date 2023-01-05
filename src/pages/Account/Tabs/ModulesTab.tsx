import {Types} from "aptos";
import {Box} from "@mui/material";
import React from "react";
import Error from "../Error";
import {useGlobalState} from "../../../GlobalState";
import {ResponseError} from "../../../api/client";
import {useQuery} from "react-query";
import {getAccountModules} from "../../../api";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";

function ModulesContent({
  data,
}: {
  data: Types.MoveModuleBytecode[] | undefined;
}): JSX.Element {
  const inDev = useGetInDevMode();

  const modules: Types.MoveModuleBytecode[] = data ?? [];
  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(modules.length);

  if (modules.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {modules.map((module, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Name:"
          titleValue={module.abi?.name ?? ""}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ContentRow
            title="Bytecode:"
            value={
              <Box style={{wordWrap: "break-word", maxHeight: 60}}>
                {module.bytecode}
              </Box>
            }
          />
          <ContentRow title="ABI:" value={<JsonViewCard data={module.abi} />} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

type ModulesTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function ModulesTab({address}: ModulesTabProps) {
  const [state, _] = useGlobalState();

  const {isLoading, data, error} = useQuery<
    Array<Types.MoveModuleBytecode>,
    ResponseError
  >(["accountModules", {address}, state.network_value], () =>
    getAccountModules({address}, state.network_value),
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  return <ModulesContent data={data} />;
}
