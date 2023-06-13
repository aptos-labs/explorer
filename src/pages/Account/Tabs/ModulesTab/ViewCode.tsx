import {
  Autocomplete,
  TextField,
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useEffect, useMemo} from "react";
import Error from "../../Error";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import {
  PackageMetadata,
  useGetAccountPackages,
} from "../../../../api/hooks/useGetAccountResource";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {getBytecodeSizeInKB} from "../../../../utils";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../../../routing";
import SidebarItem from "../../Components/SidebarItem";
import {Code} from "../../Components/CodeSnippet";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";

interface ModuleSidebarProps {
  sortedPackages: PackageMetadata[];
  selectedModuleName: string;
  getLinkToModule(moduleName: string): string;
  navigateToModule(moduleName: string): void;
}

interface ModuleContentProps {
  address: string;
  moduleName: string;
  bytecode: string;
}

function ViewCode({address}: {address: string}): JSX.Element {
  const sortedPackages: PackageMetadata[] = useGetAccountPackages(address);

  const navigate = useNavigate();

  const selectedModuleName = useParams().selectedModuleName ?? "";
  useEffect(() => {
    if (!selectedModuleName && sortedPackages.length > 0) {
      navigate(
        `/account/${address}/modules/code/${sortedPackages[0].modules[0].name}`,
        {
          replace: true,
        },
      );
    }
  }, [selectedModuleName, sortedPackages, address, navigate]);

  if (sortedPackages.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedModule = sortedPackages
    .flatMap((pkg) => pkg.modules)
    .find((module) => module.name === selectedModuleName);

  function getLinkToModule(moduleName: string) {
    return `/account/${address}/modules/code/${moduleName}`;
  }

  function navigateToModule(moduleName: string) {
    navigate(getLinkToModule(moduleName));
  }

  return (
    <Grid container spacing={2}>
      <Grid item md={3} xs={12}>
        <ModuleSidebar
          sortedPackages={sortedPackages}
          selectedModuleName={selectedModuleName}
          getLinkToModule={getLinkToModule}
          navigateToModule={navigateToModule}
        />
      </Grid>
      <Grid item md={9} xs={12}>
        {selectedModule === undefined ? (
          <EmptyTabContent
            message={`No module found with name: ${selectedModuleName}`}
          />
        ) : (
          <ModuleContent
            address={address}
            moduleName={selectedModuleName}
            bytecode={selectedModule.source}
          />
        )}
      </Grid>
    </Grid>
  );
}

function ModuleSidebar({
  sortedPackages,
  selectedModuleName,
  getLinkToModule,
  navigateToModule,
}: ModuleSidebarProps) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));
  const logEvent = useLogEventWithBasic();
  const flattedModules = useMemo(
    () =>
      sortedPackages.flatMap((pkg) =>
        pkg.modules.map((module) => ({...module, pkg: pkg.name})),
      ),
    [sortedPackages],
  );

  return (
    <Box
      sx={{padding: "24px", maxHeight: "100vh", overflowY: "auto"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      {isWideScreen ? (
        sortedPackages.map((pkg) => {
          return (
            <Box marginBottom={3} key={pkg.name}>
              <Typography fontSize={14} fontWeight={600} marginY={"12px"}>
                {pkg.name}
              </Typography>
              <Box>
                {pkg.modules.map((module) => (
                  <SidebarItem
                    key={module.name}
                    linkTo={getLinkToModule(module.name)}
                    selected={module.name === selectedModuleName}
                    name={module.name}
                    loggingInfo={{
                      eventName: "modules_clicked",
                      value: module.name,
                    }}
                  />
                ))}
                <Divider sx={{marginTop: "24px"}} />
              </Box>
            </Box>
          );
        })
      ) : (
        <Autocomplete
          fullWidth
          options={flattedModules}
          groupBy={(option) => option.pkg}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Select a module" />
          )}
          onChange={(_, module) => {
            module && logEvent("modules_clicked", module.name);
            module && navigateToModule(module?.name);
          }}
          value={
            selectedModuleName
              ? flattedModules.find(
                  (module) => module.name === selectedModuleName,
                )
              : null
          }
        />
      )}
    </Box>
  );
}

function ModuleContent({address, moduleName, bytecode}: ModuleContentProps) {
  const theme = useTheme();
  return (
    <Stack
      direction="column"
      spacing={2}
      padding={"24px"}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <ModuleHeader address={address} moduleName={moduleName} />
      <Divider />
      <Code bytecode={bytecode} />
      <Divider />
      <ABI address={address} moduleName={moduleName} />
    </Stack>
  );
}

function ModuleHeader({
  address,
  moduleName,
}: {
  address: string;
  moduleName: string;
}) {
  const {data: module} = useGetAccountModule(address, moduleName);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap={"wrap"}
    >
      <Typography fontSize={24} fontWeight={700}>
        {moduleName}
      </Typography>
      <Box>
        {module && (
          <Typography fontSize={10}>
            {module.abi?.exposed_functions?.filter((fn) => fn.is_entry)?.length}{" "}
            entry functions | Bytecode: {getBytecodeSizeInKB(module.bytecode)}{" "}
            KB
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ABI({address, moduleName}: {address: string; moduleName: string}) {
  const {
    data: module,
    isLoading,
    error,
  } = useGetAccountModule(address, moduleName);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  if (!module) {
    return <EmptyTabContent />;
  }

  return (
    <Box>
      <Typography fontSize={20} fontWeight={700} marginY={"16px"}>
        ABI
      </Typography>
      <JsonViewCard data={module.abi} />
    </Box>
  );
}

export default ViewCode;
