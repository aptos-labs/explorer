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
import {useEffect} from "react";
import {
  PackageMetadata,
  useGetAccountPackages,
} from "../../../../api/hooks/useGetAccountResource";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import {useNavigate} from "../../../../routing";
import SidebarItem from "../../Components/SidebarItem";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";
import {accountPagePath} from "../../Index";
import {MovePackageManifest} from "../../Components/MovePackageManifest";
import {useModulesPathParams} from "./Tabs";

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

  // Get selected package from path params (uses selectedModuleName for package name in packages tab)
  const {selectedModuleName} = useModulesPathParams();
  const selectedPackageName = selectedModuleName ?? "";

  useEffect(() => {
    if (
      !selectedPackageName &&
      sortedPackages.length > 0 &&
      sortedPackages[0].modules.length > 0
    ) {
      // Redirect to first package using path-based routing
      navigate({
        to: `/${accountPagePath(isObject)}/${address}/modules/packages/${sortedPackages[0].name}`,
        replace: true,
      });
    }
  }, [selectedPackageName, sortedPackages, address, navigate, isObject]);

  if (sortedPackages.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedPackage = sortedPackages.find(
    (pkg) => pkg.name === selectedPackageName,
  );

  function getLinkToPackage(packageName: string) {
    return `/${accountPagePath(isObject)}/${address}/modules/packages/${packageName}`;
  }

  function navigateToPackage(packageName: string) {
    navigate({
      to: `/${accountPagePath(isObject)}/${address}/modules/packages/${packageName}`,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{md: 3, xs: 12}}>
        <PackagesSidebar
          sortedPackages={sortedPackages}
          selectedPackageName={selectedPackageName}
          getLinkToPackage={getLinkToPackage}
          navigateToPackage={navigateToPackage}
        />
      </Grid>
      <Grid size={{md: 9, xs: 12}}>
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
      </Grid>
    </Grid>
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
          options={sortedPackages}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Select a package" />
          )}
          onChange={(_, pkg) => {
            if (pkg) {
              logEvent("package_clicked", pkg.name);
              navigateToPackage(pkg.name);
            }
          }}
          value={
            selectedPackageName
              ? sortedPackages.find((pkg) => pkg.name === selectedPackageName)
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
      bgcolor={theme.palette.background.paper}
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
            // Navigate to code view for the selected module
            navigate({
              to: `/${accountPagePath(false)}/${address}/modules/code/${value.name}`,
            });
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
