import {Types} from "aptos";
import {ResponseError, ResponseErrorType} from "../../../api/client";
import {useQuery} from "react-query";
import {Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../../GlobalState";
import {getAccountModules} from "../../../api";
import {renderSection} from "../../Transactions/helpers";
import Divider from "@mui/material/Divider";
import {renderDebug} from "../../utils";
import Typography from "@mui/material/Typography";
import Error from "../Error";
import Row from "./Row";

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

type AccountModulesSectionProps = {
  address: string;
};

export default function AccountModulesSection({
  address,
}: AccountModulesSectionProps) {
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

  const titleComponent = <Typography variant="h5">Account Modules</Typography>;

  if (error && error.type !== ResponseErrorType.NOT_FOUND) {
    return renderSection(
      <Error address={address} error={error} />,
      titleComponent,
    );
  }

  return renderSection(
    <Stack
      direction="column"
      spacing={2}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      <Content data={data} />
    </Stack>,
    titleComponent,
  );
}
