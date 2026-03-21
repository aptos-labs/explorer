import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useEffect, useMemo} from "react";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import {
  type PackageMetadata,
  useGetAccountPackages,
} from "../../../../api/hooks/useGetAccountResource";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import {useNavigate} from "../../../../routing";
import {getBytecodeSizeInKB} from "../../../../utils";
import {Code} from "../../Components/CodeSnippet";
import SidebarItem from "../../Components/SidebarItem";
import AccountError from "../../Error";
import {accountPagePath} from "../../Index";
import {useModulesPathParams} from "./Tabs";

interface ModuleSidebarProps {
  sortedPackages: PackageMetadata[];
  selectedModuleName: string;

  getLinkToModule(moduleName: string): string;

  navigateToModule(moduleName: string): void;
}

interface ModuleContentProps {
  address: string;
  moduleName: string;
  sourceBytecode: string;
  ledgerVersion?: number;
}

function ViewCode({
  address,
  isObject,
  ledgerVersion,
}: {
  address: string;
  isObject: boolean;
  ledgerVersion?: number;
}) {
  const sortedPackages: PackageMetadata[] = useGetAccountPackages(
    address,
    ledgerVersion,
  );

  const navigate = useNavigate();

  // Get selected module from path params
  const {selectedModuleName: selectedModuleFromPath} = useModulesPathParams();
  const selectedModuleName = selectedModuleFromPath ?? "";

  useEffect(() => {
    if (
      !selectedModuleName &&
      sortedPackages.length > 0 &&
      sortedPackages[0].modules.length > 0
    ) {
      // Redirect to first module using path-based routing
      navigate({
        to: `/${accountPagePath(isObject)}/${address}/modules/code/${sortedPackages[0].modules[0].name}`,
        replace: true,
      });
    }
  }, [selectedModuleName, sortedPackages, address, navigate, isObject]);

  if (sortedPackages.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedModule = sortedPackages
    .flatMap((pkg) => pkg.modules)
    .find((module) => module.name === selectedModuleName);

  function getLinkToModule(moduleName: string) {
    return `/${accountPagePath(isObject)}/${address}/modules/code/${moduleName}`;
  }

  function navigateToModule(moduleName: string) {
    navigate({
      to: `/${accountPagePath(isObject)}/${address}/modules/code/${moduleName}`,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{md: 3, xs: 12}}>
        <ModuleSidebar
          sortedPackages={sortedPackages}
          selectedModuleName={selectedModuleName}
          getLinkToModule={getLinkToModule}
          navigateToModule={navigateToModule}
        />
      </Grid>
      <Grid size={{md: 9, xs: 12}}>
        {selectedModule === undefined ? (
          <EmptyTabContent
            message={`No module found with name: ${selectedModuleName}`}
          />
        ) : (
          <ModuleContent
            address={address}
            moduleName={selectedModuleName}
            sourceBytecode={selectedModule.source}
            ledgerVersion={ledgerVersion}
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
      bgcolor={theme.palette.background.paper}
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
            if (module) {
              navigateToModule(module.name);
            }
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

function ModuleContent({
  address,
  moduleName,
  sourceBytecode,
  ledgerVersion,
}: ModuleContentProps) {
  const theme = useTheme();
  const {data: moduleBytecodeResponse} = useGetAccountModule(
    address,
    moduleName,
    ledgerVersion,
  );
  return (
    <Stack
      direction="column"
      spacing={2}
      padding={"24px"}
      bgcolor={theme.palette.background.paper}
      borderRadius={1}
    >
      <ModuleHeader
        address={address}
        moduleName={moduleName}
        ledgerVersion={ledgerVersion}
      />
      <Divider />
      <Code
        sourceBytecode={sourceBytecode}
        moduleBytecode={moduleBytecodeResponse?.bytecode}
      />
      <Divider />
      <ABI
        address={address}
        moduleName={moduleName}
        ledgerVersion={ledgerVersion}
      />
    </Stack>
  );
}

function ModuleHeader({
  address,
  moduleName,
  ledgerVersion,
}: {
  address: string;
  moduleName: string;
  ledgerVersion?: number;
}) {
  const {data: module} = useGetAccountModule(
    address,
    moduleName,
    ledgerVersion,
  );

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

function ABI({
  address,
  moduleName,
  ledgerVersion,
}: {
  address: string;
  moduleName: string;
  ledgerVersion?: number;
}) {
  const {
    data: module,
    isLoading,
    error,
  } = useGetAccountModule(address, moduleName, ledgerVersion);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <AccountError address={address} error={error} />;
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
