import {
  Autocomplete,
  TextField,
  Box,
  Divider,
  Grid2,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useEffect, useMemo} from "react";
import {
  PackageMetadata,
  useGetAccountPackages,
} from "../../../../api/hooks/useGetAccountResource";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../../../routing";
import SidebarItem from "../../Components/SidebarItem";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";
import {accountPagePath} from "../../Index";
import {MovePackageManifest} from "../../Components/MovePackageManifest";

interface PackageSidebarProps {
  sortedPackages: PackageMetadata[];
  selectedPackageName: string;

  getLinkToPackage(moduleName: string): string;

  navigateToPackage(moduleName: string): void;
}

interface PackageContentProps {
  address: string;
  packageMetadata: PackageMetadata;
  packageName: string;
}

function Packages({address, isObject}: {address: string; isObject: boolean}) {
  const sortedPackages: PackageMetadata[] = useGetAccountPackages(address);

  const navigate = useNavigate();

  const selectedPackageName = useParams().selectedModuleName ?? "";
  useEffect(() => {
    if (
      !selectedPackageName &&
      sortedPackages.length > 0 &&
      sortedPackages[0].modules.length > 0
    ) {
      navigate(
        `/${accountPagePath(isObject)}/${address}/modules/packages/${sortedPackages[0].name}`,
        {
          replace: true,
        },
      );
    }
  }, [selectedPackageName, sortedPackages, address, navigate, isObject]);

  if (sortedPackages.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedPackage = sortedPackages.find(
    (pkg) => pkg.name === selectedPackageName,
  );

  function getLinkToPackage(moduleName: string) {
    return `/${accountPagePath(isObject)}/${address}/modules/packages/${moduleName}`;
  }

  function navigateToPackage(moduleName: string) {
    navigate(getLinkToPackage(moduleName));
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{md: 3, xs: 12}}>
        <PackagesSidebar
          sortedPackages={sortedPackages}
          selectedPackageName={selectedPackageName}
          getLinkToPackage={getLinkToPackage}
          navigateToPackage={navigateToPackage}
        />
      </Grid2>
      <Grid2 size={{md: 9, xs: 12}}>
        {selectedPackage === undefined ? (
          <EmptyTabContent
            message={`No package found with name: ${selectedPackageName}`}
          />
        ) : (
          <PackageContent
            address={address}
            packageMetadata={selectedPackage}
            packageName={selectedPackageName}
          />
        )}
      </Grid2>
    </Grid2>
  );
}

function PackagesSidebar({
  sortedPackages,
  selectedPackageName,
  getLinkToPackage,
  navigateToPackage,
}: PackageSidebarProps) {
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
              <SidebarItem
                key={pkg.name}
                linkTo={getLinkToPackage(pkg.name)}
                selected={pkg.name === selectedPackageName}
                name={pkg.name}
                loggingInfo={{
                  eventName: "modules_clicked",
                  value: pkg.name,
                }}
              />
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
              logEvent("modules_clicked", module.name);
              navigateToPackage(module?.name);
            }
          }}
          value={
            selectedPackageName
              ? flattedModules.find(
                  (module) => module.name === selectedPackageName,
                )
              : null
          }
        />
      )}
    </Box>
  );
}

function PackageContent({address, packageMetadata}: PackageContentProps) {
  const theme = useTheme();
  return (
    <Stack
      direction="column"
      spacing={2}
      padding={"24px"}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <PackageHeader packageName={packageMetadata.name} />
      <Divider />
      <PackageInfo address={address} packageMetadata={packageMetadata} />
    </Stack>
  );
}

function PackageHeader({packageName}: {packageName: string}) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap={"wrap"}
    >
      <Typography fontSize={24} fontWeight={700}>
        {packageName}
      </Typography>
    </Box>
  );
}

function PackageInfo({
  address,
  packageMetadata,
}: {
  address: string;
  packageMetadata: PackageMetadata;
}) {
  const navigate = useNavigate();

  return (
    <Box>
      <Box marginTop={2}>
        <Typography fontSize={14} fontWeight={600}>
          Modules
        </Typography>
        <Autocomplete
          disableClearable
          options={packageMetadata.modules}
          getOptionLabel={(option) => option.name}
          defaultValue={packageMetadata.modules[0]}
          onChange={(_event, value) => {
            navigate(
              `${accountPagePath(false)}/${address}/modules/code/${value.name}`,
            );
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" />
          )}
        />
      </Box>
      <Box marginTop={2}>
        <Typography fontSize={14} fontWeight={600}>
          Package Name
        </Typography>
        <Typography>{packageMetadata.name}</Typography>
      </Box>
      <Box marginTop={2}>
        <Typography fontSize={14} fontWeight={600}>
          Upgrade Policy
        </Typography>
        {upgrade_policy(packageMetadata.upgrade_policy.policy)}
      </Box>
      <Box marginTop={2}>
        <Typography fontSize={14} fontWeight={600}>
          Upgrade Number
        </Typography>
        <Typography>{packageMetadata.upgrade_number}</Typography>
      </Box>
      <Box marginTop={2}>
        <Typography fontSize={14} fontWeight={600}>
          Source Digest
        </Typography>
        <Typography>{packageMetadata.source_digest}</Typography>
      </Box>

      <MovePackageManifest manifest={packageMetadata.manifest} />
    </Box>
  );
}

function upgrade_policy(policyNumber: number) {
  let policy = "Unknown";
  switch (policyNumber) {
    case 0:
      policy = "Arbitrary";
      break;
    case 1:
      policy = "Compatible";
      break;
    case 3:
      policy = "Immutable";
      break;
  }

  return <Typography>{policy}</Typography>;
}

export default Packages;
