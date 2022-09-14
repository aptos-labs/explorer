import {Types} from "aptos";
import {Stack} from "@mui/material";
import React from "react";
import Divider from "@mui/material/Divider";
import Error from "../Error";
import Row from "../Row";
import {renderDebug} from "../../utils";
import {useGlobalState} from "../../../GlobalState";
import {ResponseError} from "../../../api/client";
import {useQuery} from "react-query";
import {getAccountModules} from "../../../api";

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
            <Row title={"ABI:"} value={renderDebug(module.abi)} />
          </Stack>
        ))}
      </>
    );
  }
}

type ModulesTabProps = {
  address: string;
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

  return (
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
