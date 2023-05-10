import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Modal,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {ContentCopy, OpenInFull} from "@mui/icons-material";
import {orderBy} from "lodash";
import React, {useEffect, useRef, useState} from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import Error from "../../Error";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import {useGetAccountResource} from "../../../../api/hooks/useGetAccountResource";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../../../components/StyledTooltip";
import SidebarItem from "../../Components/SidebarItem";
import {
  codeBlockColor,
  codeBlockColorRgbDark,
  codeBlockColorRgbLight,
  grey,
} from "../../../../themes/colors/aptosColorPalette";
import {
  getBytecodeSizeInKB,
  getPublicFunctionLineNumber,
  transformCode,
} from "../../../../utils";

import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import {useParams, useSearchParams} from "react-router-dom";
import {useNavigate} from "../../../../routing";

type PackageMetadata = {
  name: string;
  modules: {
    name: string;
    source: string;
  }[];
};

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
  const {data: registry} = useGetAccountResource(
    address,
    "0x1::code::PackageRegistry",
  );

  const registryData = registry?.data as any;
  const sortedPackages: PackageMetadata[] =
    registryData?.packages?.map((pkg: any) => {
      const sortedModules = orderBy(pkg.modules, "name");
      return {name: pkg.name, modules: sortedModules};
    }) || [];

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
  }, [selectedModuleName, sortedPackages]);

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

  return (
    <Box
      sx={{padding: "24px", maxHeight: "100vh", overflowY: "auto"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      {sortedPackages.map((pkg) => {
        return (
          <Box marginBottom={3}>
            <Typography fontSize={14} fontWeight={600} marginY={"12px"}>
              {pkg.name}
            </Typography>
            {isWideScreen ? (
              <Box>
                {pkg.modules.map((module) => (
                  <SidebarItem
                    key={module.name}
                    linkTo={getLinkToModule(module.name)}
                    selected={module.name === selectedModuleName}
                    name={module.name}
                  />
                ))}
                <Divider sx={{marginTop: "24px"}} />
              </Box>
            ) : (
              <FormControl fullWidth>
                <Select
                  value={selectedModuleName}
                  onChange={(e) => navigateToModule(e.target.value)}
                >
                  {pkg.modules.map((module, i) => (
                    <MenuItem
                      key={module.name + i}
                      value={module.name}
                      sx={
                        theme.palette.mode === "dark" &&
                        module.name !== selectedModuleName
                          ? {
                              color: grey[400],
                              ":hover": {
                                color: grey[200],
                              },
                            }
                          : {}
                      }
                    >
                      {module.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        );
      })}
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

function useStartingLineNumber(sourceCode?: string) {
  if (!sourceCode) return 0;

  const functionToHighlight = useParams().selectedFnName;
  if (!functionToHighlight) return 0;

  return getPublicFunctionLineNumber(sourceCode, functionToHighlight);
}

function Code({bytecode}: {bytecode: string}) {
  const TOOLTIP_TIME = 2000; // 2s

  const sourceCode = bytecode === "0x" ? undefined : transformCode(bytecode);

  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  async function copyCode(event: React.MouseEvent<HTMLButtonElement>) {
    if (!sourceCode) return;

    await navigator.clipboard.writeText(sourceCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  const startingLineNumber = useStartingLineNumber(sourceCode);
  const codeBoxScrollRef = useRef<any>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  });

  return (
    <Box>
      <Stack
        direction="row"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Stack
          direction="row"
          spacing={1}
          marginY={"16px"}
          alignItems={"center"}
        >
          <Typography fontSize={20} fontWeight={700}>
            Code
          </Typography>
          <StyledLearnMoreTooltip text="Please be aware that this code was provided by the owner and it could be different to the real code on blockchain. We can not not verify it." />
        </Stack>
        <Stack direction="row" spacing={2}>
          <StyledTooltip
            title="Code copied"
            placement="right"
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Button
              variant="outlined"
              onClick={copyCode}
              disabled={!sourceCode}
              sx={{
                display: "flex",
                alignItems: "center",
                height: "2rem",
                borderRadius: "0.5rem",
              }}
            >
              <ContentCopy style={{height: "1.25rem", width: "1.25rem"}} />{" "}
              <Typography
                marginLeft={1}
                sx={{
                  display: "inline",
                  whiteSpace: "nowrap",
                }}
              >
                copy code
              </Typography>
            </Button>
          </StyledTooltip>
          <ExpandCode sourceCode={sourceCode} />
        </Stack>
      </Stack>
      {sourceCode && (
        <Typography
          variant="body1"
          fontSize={14}
          fontWeight={400}
          marginBottom={"16px"}
          color={theme.palette.mode === "dark" ? grey[400] : grey[600]}
        >
          The source code is plain text uploaded by the deployer, which can be
          different from the actual bytecode.
        </Typography>
      )}
      {!sourceCode ? (
        <Box>
          Unfortunately, the source code cannot be shown because the package
          publisher has chosen not to make it available
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "100vh",
            overflow: "auto",
            borderRadius: 1,
            backgroundColor: codeBlockColor,
          }}
          ref={codeBoxScrollRef}
        >
          <SyntaxHighlighter
            language="rust"
            key={theme.palette.mode}
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{margin: 0, backgroundColor: "unset"}}
            showLineNumbers
          >
            {sourceCode}
          </SyntaxHighlighter>
        </Box>
      )}
    </Box>
  );
}

function ExpandCode({sourceCode}: {sourceCode: string | undefined}) {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const startingLineNumber = useStartingLineNumber(sourceCode);
  const codeBoxScrollRef = useRef<any>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  });

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleOpenModal}
        disabled={!sourceCode}
        sx={{
          height: "2rem",
          width: "2rem",
          minWidth: "unset",
          borderRadius: "0.5rem",
        }}
      >
        <OpenInFull style={{height: "1.25rem", width: "1.25rem"}} />
      </Button>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "80%",
            width: "80%",
            overflowY: "auto",
            borderRadius: 1,
          }}
          ref={codeBoxScrollRef}
        >
          <SyntaxHighlighter
            language="rust"
            key={theme.palette.mode}
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{
              margin: 0,
              backgroundColor:
                theme.palette.mode === "light"
                  ? codeBlockColorRgbLight
                  : codeBlockColorRgbDark,
            }}
            showLineNumbers
          >
            {sourceCode!}
          </SyntaxHighlighter>
        </Box>
      </Modal>
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
