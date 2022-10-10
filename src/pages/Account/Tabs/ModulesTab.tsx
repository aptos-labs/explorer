import {Types} from "aptos";
import {Box, Stack} from "@mui/material";
import React from "react";
import Divider from "@mui/material/Divider";
import Error from "../Error";
import Row from "../Row";
import {renderDebug} from "../../utils";
import {useGlobalState} from "../../../GlobalState";
import {ResponseError} from "../../../api/client";
import {useQuery} from "react-query";
import {getAccountModules} from "../../../api";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const copyToClipboard = (content: any) => {
  const el = document.createElement('textarea');
  el.value = content;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function Content({
  data,
}: {
  data: Types.MoveModuleBytecode[] | undefined;
}): JSX.Element {
  if (!data || data.length === 0) {
    return <>None</>;
  } else {
    return (
      <>
        {data.map((module, i) => (
          <Stack direction="column" key={i} spacing={3}>
            <Row title={"Bytecode:"} value={module.bytecode} />
            <div onClick={()=>copyToClipboard(JSON.stringify(module.abi))}>
              ABI<ContentCopyIcon
                fontSize="small"
              />:
            </div>
            <Row title="" value={renderDebug(module.abi)} />
          </Stack>
        ))}
      </>
    );
  }
}

type ModulesTabProps = {
  address: string;
};

function ModulesContent({
  data,
}: {
  data: Types.MoveModuleBytecode[] | undefined;
}): JSX.Element {
  if (!data || data.length === 0) {
    return <EmptyTabContent />;
  }

  const modules: Types.MoveModuleBytecode[] = data;

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(modules.length);

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
          <ContentRow title="ABI:" value={<JsonCard data={module.abi} />} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

export default function ModulesTab({address}: ModulesTabProps) {
  const inDev = useGetInDevMode();
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

  return inDev ? (
    <ModulesContent data={data} />
  ) : (
    <Stack
      marginX={2}
      direction="column"
      spacing={2}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      <Content data={data} />
    </Stack>
  );
}
