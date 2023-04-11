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
import StyledTooltip from "../../../../components/StyledTooltip";
import {
  codeBlockColor,
  codeBlockColorRgbDark,
  codeBlockColorRgbLight,
  grey,
} from "../../../../themes/colors/aptosColorPalette";
import {getBytecodeSizeInKB, transformCode} from "../../../../utils";

import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import {useParams, useSearchParams} from "react-router-dom";
import {
  InternalLink,
  useAugmentToWithGlobalSearchParams,
  useNavigate,
} from "../../../../routing";

type PackageMetadata = {
  name: string;
  modules: {
    name: string;
    source: string;
  }[];
};

interface ModuleSidebarProps {
  moduleNames: string[];
  selectedModuleName: string;
  getLinkToModule(moduleName: string): string;
  navigateToModule(moduleName: string): void;
}

interface ModuleNameOptionProps {
  linkTo: string;
  selected: boolean;
  name: string;
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

  const packages: PackageMetadata[] =
    registry === undefined ? [] : (registry.data as any).packages;
  const modules = orderBy(
    packages.flatMap((p) => p.modules),
    "name",
  );

  const navigate = useNavigate();
  const augmentToWithGlobalSearchParams = useAugmentToWithGlobalSearchParams();

  const selectedModuleName = useParams().selectedModuleName ?? "";
  if (!selectedModuleName && modules.length > 0) {
    navigate(`/account/${address}/modules/${modules[0].name}`, {replace: true});
  }

  if (modules.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedModule = modules.find(
    (module) => module.name === selectedModuleName,
  );

  function getLinkToModule(moduleName: string) {
    return `/account/${address}/modules/${moduleName}`;
  }

  function navigateToModule(moduleName: string) {
    navigate(getLinkToModule(moduleName));
  }

  return (
    <Grid container spacing={2}>
      <Grid item md={3} xs={12}>
        <ModuleSidebar
          moduleNames={modules.map((m) => m.name)}
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
  moduleNames,
  selectedModuleName,
  getLinkToModule,
  navigateToModule,
}: ModuleSidebarProps) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{padding: "24px"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <Typography fontSize={16} fontWeight={500} marginBottom={"24px"}>
        Modules
      </Typography>
      {isWideScreen ? (
        <Box
          sx={{
            maxHeight: "100vh",
            overflowY: "auto",
          }}
        >
          {moduleNames.map((moduleName, i) => (
            <ModuleNameOption
              key={moduleName}
              linkTo={getLinkToModule(moduleName)}
              selected={moduleName === selectedModuleName}
              name={moduleName}
            />
          ))}
        </Box>
      ) : (
        <FormControl fullWidth>
          <Select
            value={selectedModuleName}
            onChange={(e) => navigateToModule(e.target.value)}
          >
            {moduleNames.map((moduleName, i) => (
              <MenuItem
                key={moduleName}
                value={moduleName}
                sx={
                  theme.palette.mode === "dark" &&
                  moduleName !== selectedModuleName
                    ? {
                        color: grey[400],
                        ":hover": {
                          color: grey[200],
                        },
                      }
                    : {}
                }
              >
                {moduleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}

function ModuleNameOption({selected, name, linkTo}: ModuleNameOptionProps) {
  const theme = useTheme();

  return (
    <InternalLink to={linkTo}>
      <Box
        key={name}
        sx={{
          fontSize: 12,
          fontWeight: selected ? 600 : 400,
          padding: "8px",
          borderRadius: 1,
          bgcolor: !selected
            ? "transparent"
            : theme.palette.mode === "dark"
            ? grey[500]
            : grey[200],
          ...(theme.palette.mode === "dark" && !selected && {color: grey[400]}),
          ":hover": {
            cursor: "pointer",
            ...(theme.palette.mode === "dark" &&
              !selected && {color: grey[200]}),
          },
        }}
      >
        {name}
      </Box>
    </InternalLink>
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
    <Box display="flex" justifyContent="space-between" alignItems="center">
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

// inspired by https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(regexpString: string) {
  return regexpString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function useStartingLineNumber(sourceCode?: string) {
  const [searchParams] = useSearchParams();

  if (!sourceCode) return 0;

  const entryFunctionToHightlight = searchParams.get("entry_function");
  if (entryFunctionToHightlight == null) return 0;

  const lines = sourceCode.split("\n");
  const publicEntryFunRegexp = new RegExp(
    `\\s*public\\s*entry\\s*fun\\s*${escapeRegExp(
      entryFunctionToHightlight,
    )}(<.*>)?\\s*\\(`,
  );
  const lineNumber = lines.findIndex((line) =>
    line.match(publicEntryFunRegexp),
  );
  if (lineNumber !== -1) {
    return lineNumber;
  }

  return 0;
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={20} fontWeight={700} marginY={"16px"}>
          Code
        </Typography>
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
              <Typography marginLeft={1}>copy code</Typography>
            </Button>
          </StyledTooltip>
          <ExpandCode sourceCode={sourceCode} />
        </Stack>
      </Box>
      {!sourceCode ? (
        <Box>
          Unfortunately, the source code cannot be shown because the package
          publisher has chosen not to make it available
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "100vh",
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
            customStyle={{margin: 0, backgroundColor: codeBlockColor}}
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
