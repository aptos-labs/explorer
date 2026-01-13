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

// Extract short resource name from type
function getShortResourceName(change: Types.WriteSetChange): string | null {
  if (
    "data" in change &&
    change.data &&
    typeof change.data === "object" &&
    "type" in change.data
  ) {
    const fullType = change.data.type;
    const parts = fullType.split("::");
    const baseName = parts[parts.length - 1]?.split("<")[0] || fullType;
    return baseName;
  }
  return null;
}

type ChangesTabProps = {
  transaction: Types.Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  const theme = useTheme();
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  // Track which cards are expanded (default: first 3 expanded)
  const [expandedList, setExpandedList] = useState<boolean[]>(() =>
    changes.map((_, i) => i < 3),
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
          const resourceName = getShortResourceName(change);

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
                  padding: "4px 16px",
                  minHeight: 48,
                  "& .MuiAccordionSummary-content": {
                    margin: "8px 0",
                    alignItems: "center",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    flex: 1,
                    mr: 1,
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
                  {resourceName && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: theme.palette.text.primary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: {xs: 150, sm: 300, md: 400},
                      }}
                    >
                      {resourceName}
                    </Typography>
                  )}
                </Box>
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
