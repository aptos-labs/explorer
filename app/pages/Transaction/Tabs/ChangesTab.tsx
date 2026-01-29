import * as React from "react";
import {useState, useMemo} from "react";
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
  TextField,
  InputAdornment,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import IdentifiedChangeCard from "./Components/IdentifiedChangeCard";

// Change type categories for filtering
type ChangeCategory = "write" | "create" | "delete" | "table" | "module";

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

// Get change category for filtering
function getChangeCategory(type: string): ChangeCategory {
  if (type.includes("table")) return "table";
  if (type.includes("module")) return "module";
  if (type.includes("create")) return "create";
  if (type.includes("delete")) return "delete";
  return "write";
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

// Extract all addresses from a change (including nested in data)
function extractAllAddresses(change: Types.WriteSetChange): string[] {
  const addresses: Set<string> = new Set();

  // Add the main address
  const mainAddress = getChangeAddress(change);
  if (mainAddress) {
    addresses.add(mainAddress.toLowerCase());
  }

  // Recursively extract addresses from data
  function extractFromValue(value: unknown): void {
    if (!value) return;

    if (typeof value === "string") {
      // Check if it looks like an address (0x followed by hex)
      if (/^0x[a-fA-F0-9]+$/.test(value) && value.length >= 10) {
        addresses.add(value.toLowerCase());
      }
    } else if (Array.isArray(value)) {
      value.forEach(extractFromValue);
    } else if (typeof value === "object") {
      Object.values(value).forEach(extractFromValue);
    }
  }

  if ("data" in change && change.data) {
    extractFromValue(change.data);
  }

  // Also check handle, key, value for table items
  if ("handle" in change) extractFromValue(change.handle);
  if ("key" in change) extractFromValue(change.key);
  if ("value" in change) extractFromValue(change.value);

  return Array.from(addresses);
}

// Get searchable text from a change
function getSearchableText(change: Types.WriteSetChange): string {
  const parts: string[] = [];

  // Add address
  const address = getChangeAddress(change);
  if (address) parts.push(address.toLowerCase());

  // Add resource type
  const resourceType = getResourceType(change);
  if (resourceType) parts.push(resourceType.toLowerCase());

  // Add all addresses found in data
  const allAddresses = extractAllAddresses(change);
  parts.push(...allAddresses);

  // Add handle/key for table items
  if ("handle" in change && change.handle) {
    parts.push(String(change.handle).toLowerCase());
  }
  if ("key" in change && change.key) {
    parts.push(String(change.key).toLowerCase());
  }

  return parts.join(" ");
}

// Truncate address for display
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get unique resource names from changes for quick filter suggestions
function getUniqueResources(changes: Types.WriteSetChange[]): string[] {
  const resources = new Set<string>();
  changes.forEach((change) => {
    const resourceType = getResourceType(change);
    if (resourceType) {
      // Extract module::resource name (without generics)
      const match = resourceType.match(/0x[^:]+::([^<]+)/);
      if (match) {
        resources.add(match[1]);
      }
    }
  });
  return Array.from(resources).sort();
}

type ChangesTabProps = {
  transaction: Types.Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  const theme = useTheme();
  const changes: Types.WriteSetChange[] = useMemo(
    () => ("changes" in transaction ? transaction.changes : []),
    [transaction],
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    Set<ChangeCategory>
  >(new Set());
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Track which cards are expanded (default: all collapsed)
  const [expandedList, setExpandedList] = useState<boolean[]>(() =>
    changes.map(() => false),
  );

  // Track which cards show raw JSON
  const [showJsonList, setShowJsonList] = useState<boolean[]>(() =>
    changes.map(() => false),
  );

  // Get unique resources for filter chips
  const uniqueResources = useMemo(() => getUniqueResources(changes), [changes]);

  // Filter changes based on search query and selected filters
  const filteredChanges = useMemo(() => {
    return changes
      .map((change, originalIndex) => ({change, originalIndex}))
      .filter(({change}) => {
        // Filter by category
        if (selectedCategories.size > 0) {
          const category = getChangeCategory(change.type);
          if (!selectedCategories.has(category)) {
            return false;
          }
        }

        // Filter by resource
        if (selectedResource) {
          const resourceType = getResourceType(change);
          if (!resourceType || !resourceType.includes(selectedResource)) {
            return false;
          }
        }

        // Filter by search query
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase().trim();
          const searchableText = getSearchableText(change);
          if (!searchableText.includes(searchLower)) {
            return false;
          }
        }

        return true;
      });
  }, [changes, searchQuery, selectedCategories, selectedResource]);

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
    const newList = [...expandedList];
    filteredChanges.forEach(({originalIndex}) => {
      newList[originalIndex] = true;
    });
    setExpandedList(newList);
  };

  const collapseAll = () => {
    const newList = [...expandedList];
    filteredChanges.forEach(({originalIndex}) => {
      newList[originalIndex] = false;
    });
    setExpandedList(newList);
  };

  const toggleCategory = (category: ChangeCategory) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories(new Set());
    setSelectedResource(null);
  };

  const hasActiveFilters =
    searchQuery.trim() || selectedCategories.size > 0 || selectedResource;

  // Category filter options
  const allCategoryOptions: {
    key: ChangeCategory;
    label: string;
    count: number;
  }[] = [
    {
      key: "write",
      label: "Write",
      count: changes.filter((c) => getChangeCategory(c.type) === "write")
        .length,
    },
    {
      key: "create",
      label: "Create",
      count: changes.filter((c) => getChangeCategory(c.type) === "create")
        .length,
    },
    {
      key: "delete",
      label: "Delete",
      count: changes.filter((c) => getChangeCategory(c.type) === "delete")
        .length,
    },
    {
      key: "table",
      label: "Table",
      count: changes.filter((c) => getChangeCategory(c.type) === "table")
        .length,
    },
    {
      key: "module",
      label: "Module",
      count: changes.filter((c) => getChangeCategory(c.type) === "module")
        .length,
    },
  ];
  const categoryOptions = allCategoryOptions.filter((opt) => opt.count > 0);

  return (
    <Box marginTop={3}>
      {/* Search and filter section */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          padding: 2,
          mb: 2,
        }}
      >
        {/* Search input */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by address, resource type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{color: theme.palette.text.secondary, fontSize: 20}}
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={() => setSearchQuery("")}
                    sx={{minWidth: "auto", p: 0.5}}
                  >
                    <ClearIcon sx={{fontSize: 18}} />
                  </Button>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.05)
                  : alpha(theme.palette.common.black, 0.02),
            },
          }}
        />

        {/* Change type filters */}
        <Box sx={{mb: 1.5}}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              display: "block",
              mb: 0.75,
            }}
          >
            Change Type
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {categoryOptions.map(({key, label, count}) => (
              <Chip
                key={key}
                label={`${label} (${count})`}
                size="small"
                onClick={() => toggleCategory(key)}
                color={selectedCategories.has(key) ? "primary" : "default"}
                variant={selectedCategories.has(key) ? "filled" : "outlined"}
                sx={{
                  fontSize: "0.7rem",
                  height: 26,
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Resource type filters (show top 8) */}
        {uniqueResources.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: "block",
                mb: 0.75,
              }}
            >
              Resource Type
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {uniqueResources.slice(0, 8).map((resource) => (
                <Chip
                  key={resource}
                  label={resource}
                  size="small"
                  onClick={() =>
                    setSelectedResource(
                      selectedResource === resource ? null : resource,
                    )
                  }
                  color={selectedResource === resource ? "primary" : "default"}
                  variant={
                    selectedResource === resource ? "filled" : "outlined"
                  }
                  sx={{
                    fontSize: "0.7rem",
                    height: 26,
                    fontFamily: "monospace",
                  }}
                />
              ))}
              {uniqueResources.length > 8 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    alignSelf: "center",
                  }}
                >
                  +{uniqueResources.length - 8} more
                </Typography>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Header with count and expand/collapse buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="subtitle2"
            sx={{color: theme.palette.text.secondary}}
          >
            {filteredChanges.length === changes.length
              ? `${changes.length} Change${changes.length !== 1 ? "s" : ""}`
              : `${filteredChanges.length} of ${changes.length} Changes`}
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={clearFilters}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                minWidth: "auto",
              }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<UnfoldMoreIcon />}
            onClick={expandAll}
            sx={{textTransform: "none"}}
            disabled={filteredChanges.length === 0}
          >
            Expand All
          </Button>
          <Button
            size="small"
            startIcon={<UnfoldLessIcon />}
            onClick={collapseAll}
            sx={{textTransform: "none"}}
            disabled={filteredChanges.length === 0}
          >
            Collapse All
          </Button>
        </Stack>
      </Box>

      {/* No results message */}
      {filteredChanges.length === 0 && hasActiveFilters && (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: theme.palette.text.secondary,
          }}
        >
          <Typography variant="body2">
            No changes match your filters.
          </Typography>
          <Button
            size="small"
            onClick={clearFilters}
            sx={{mt: 1, textTransform: "none"}}
          >
            Clear filters
          </Button>
        </Box>
      )}

      {/* Changes list */}
      <Stack spacing={1}>
        {filteredChanges.map(({change, originalIndex}) => {
          const shortLabel = getChangeTypeShortLabel(change.type);
          const chipColor = getChangeTypeColor(change.type);
          const resourceType = getResourceType(change);
          const address = getChangeAddress(change);

          return (
            <Accordion
              key={originalIndex}
              expanded={expandedList[originalIndex]}
              onChange={() => toggleExpanded(originalIndex)}
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
                    #{originalIndex}
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
                {expandedList[originalIndex] && (
                  <>
                    <IdentifiedChangeCard
                      change={change}
                      index={originalIndex}
                    />

                    {/* Toggle for raw JSON view */}
                    <Box sx={{mt: 2}}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShowJson(originalIndex);
                        }}
                        sx={{
                          textTransform: "none",
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        {showJsonList[originalIndex]
                          ? "Hide Raw JSON"
                          : "Show Raw JSON"}
                      </Button>
                      {showJsonList[originalIndex] && (
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
