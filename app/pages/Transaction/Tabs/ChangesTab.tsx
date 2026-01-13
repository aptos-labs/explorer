import * as React from "react";
import {useState} from "react";
import {Types} from "aptos";
import {
  Box,
  Typography,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import IdentifiedChangeCard from "./Components/IdentifiedChangeCard";

// Get a short label for the change type in the accordion header
function getChangeTypeShortLabel(type: string): string {
  switch (type) {
    case "write_resource":
      return "Write";
    case "create_resource":
      return "Create";
    case "delete_resource":
      return "Delete";
    case "write_module":
      return "Module";
    case "delete_module":
      return "Del Module";
    case "write_table_item":
      return "Table Write";
    case "delete_table_item":
      return "Table Delete";
    default:
      return type;
  }
}

// Get chip color for change type
function getChangeTypeColor(
  type: string,
): "default" | "info" | "success" | "error" {
  if (type.includes("create")) return "success";
  if (type.includes("delete")) return "error";
  if (type.includes("write")) return "info";
  return "default";
}

// Extract full resource type from change
function getResourceType(change: Types.WriteSetChange): string | null {
  if (
    "data" in change &&
    change.data &&
    typeof change.data === "object" &&
    "type" in change.data
  ) {
    return change.data.type;
  }
  return null;
}

// Get address from change
function getChangeAddress(change: Types.WriteSetChange): string | null {
  if ("address" in change && change.address) {
    return change.address;
  }
  return null;
}

// Truncate address for display
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type ChangesTabProps = {
  transaction: Types.Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  const theme = useTheme();
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  // Track which cards are expanded (default: all collapsed)
  const [expandedList, setExpandedList] = useState<boolean[]>(() =>
    changes.map(() => false),
  );

  // Track which cards show raw JSON
  const [showJsonList, setShowJsonList] = useState<boolean[]>(() =>
    changes.map(() => false),
  );

  if (changes.length === 0) {
    return <EmptyTabContent />;
  }

  const toggleExpanded = (index: number) => {
    setExpandedList((prev) => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  const toggleShowJson = (index: number) => {
    setShowJsonList((prev) => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  const expandAll = () => {
    setExpandedList(changes.map(() => true));
  };

  const collapseAll = () => {
    setExpandedList(changes.map(() => false));
  };

  return (
    <Box marginTop={3}>
      {/* Header with expand/collapse all buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{color: theme.palette.text.secondary}}
        >
          {changes.length} Change{changes.length !== 1 ? "s" : ""}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<UnfoldMoreIcon />}
            onClick={expandAll}
            sx={{textTransform: "none"}}
          >
            Expand All
          </Button>
          <Button
            size="small"
            startIcon={<UnfoldLessIcon />}
            onClick={collapseAll}
            sx={{textTransform: "none"}}
          >
            Collapse All
          </Button>
        </Stack>
      </Box>

      {/* Changes list */}
      <Stack spacing={1}>
        {changes.map((change, i) => {
          const shortLabel = getChangeTypeShortLabel(change.type);
          const chipColor = getChangeTypeColor(change.type);
          const resourceType = getResourceType(change);
          const address = getChangeAddress(change);

          return (
            <Accordion
              key={i}
              expanded={expandedList[i]}
              onChange={() => toggleExpanded(i)}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: `${theme.shape.borderRadius}px !important`,
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  margin: 0,
                  marginBottom: 1,
                },
              }}
              disableGutters
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  padding: "8px 16px",
                  minHeight: "auto",
                  "& .MuiAccordionSummary-content": {
                    margin: "4px 0",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                  },
                }}
              >
                {/* First row: index, type chip, and address */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      minWidth: 30,
                      fontWeight: 500,
                    }}
                  >
                    #{i}
                  </Typography>
                  <Chip
                    label={shortLabel}
                    size="small"
                    color={chipColor}
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      fontWeight: 500,
                    }}
                  />
                  {address && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        color: theme.palette.text.secondary,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                        padding: "2px 8px",
                        borderRadius: 1,
                      }}
                    >
                      {truncateAddress(address)}
                    </Typography>
                  )}
                </Box>
                {/* Second row: full resource type */}
                {resourceType && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: theme.palette.text.primary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      pl: "46px", // align with content after index
                    }}
                  >
                    {resourceType}
                  </Typography>
                )}
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: 2,
                  paddingTop: 0,
                }}
              >
                {expandedList[i] && (
                  <>
                    <IdentifiedChangeCard change={change} index={i} />

                    {/* Toggle for raw JSON view */}
                    <Box sx={{mt: 2}}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShowJson(i);
                        }}
                        sx={{
                          textTransform: "none",
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        {showJsonList[i] ? "Hide Raw JSON" : "Show Raw JSON"}
                      </Button>
                      {showJsonList[i] && (
                        <Box sx={{mt: 1}}>
                          <JsonViewCard data={change} />
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
