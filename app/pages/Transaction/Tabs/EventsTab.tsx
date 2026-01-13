import React, {useState} from "react";
import {Types} from "aptos";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import IdentifiedEventData, {
  canDisplayIdentifiedEventData,
} from "./Components/IdentifiedEventCard";

type EventsTabProps = {
  transaction: Types.Transaction;
};

// Check if this is an events v2 / module event by detecting zero values.
// Module events have account_address as 0x0, creation_number as "0", and
// sequence_number as "0" for backwards compatibility.
function isModuleEvent(event: Types.Event): boolean {
  const zeroAddress =
    event.guid.account_address === "0x0" ||
    event.guid.account_address ===
      "0x0000000000000000000000000000000000000000000000000000000000000000";
  const zeroCreationNumber = event.guid.creation_number === "0";
  const zeroSequenceNumber = event.sequence_number === "0";
  return zeroAddress && zeroCreationNumber && zeroSequenceNumber;
}

// Extract short event name from full type string
// e.g., "0x1::coin::WithdrawEvent" -> "WithdrawEvent"
function getEventShortName(eventType: string): string {
  // Handle generics - remove them for display
  const baseType = eventType.split("<")[0];
  const parts = baseType.split("::");
  return parts.length >= 3 ? parts[2] : parts[parts.length - 1] || eventType;
}

// Get module path from event type
// e.g., "0x1::coin::WithdrawEvent" -> "0x1::coin"
function getModulePath(eventType: string): string {
  const baseType = eventType.split("<")[0];
  const parts = baseType.split("::");
  if (parts.length >= 2) {
    return `${parts[0]}::${parts[1]}`;
  }
  return "";
}

// Truncate address for display
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function EventsTab({transaction}: EventsTabProps) {
  const theme = useTheme();
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  // Start all events collapsed
  const [expandedList, setExpandedList] = useState<boolean[]>(
    new Array(events.length).fill(false),
  );
  const [showJsonList, setShowJsonList] = useState<boolean[]>(
    new Array(events.length).fill(false),
  );

  const toggleExpanded = (index: number) => {
    setExpandedList((prev) => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  const expandAll = () => {
    setExpandedList(new Array(events.length).fill(true));
  };

  const collapseAll = () => {
    setExpandedList(new Array(events.length).fill(false));
  };

  const toggleShowJson = (index: number) => {
    setShowJsonList((prev) => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  if (events.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <Box marginTop={3}>
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
        <Typography
          variant="subtitle2"
          sx={{color: theme.palette.text.secondary}}
        >
          {events.length} Event{events.length !== 1 ? "s" : ""}
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

      {/* Events list */}
      <Stack spacing={1}>
        {events.map((event, i) => {
          const isModule = isModuleEvent(event);
          const shortName = getEventShortName(event.type);
          const modulePath = getModulePath(event.type);
          const address = !isModule ? event.guid.account_address : null;

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
                {/* First row: index, event name chip, and address */}
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
                    label={shortName}
                    size="small"
                    color="info"
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
                  {isModule && (
                    <Chip
                      label="Module Event"
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                      }}
                    />
                  )}
                </Box>
                {/* Second row: full event type path */}
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
                  {modulePath && (
                    <Typography
                      component="span"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {modulePath}::
                    </Typography>
                  )}
                  {shortName}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: 2,
                  paddingTop: 0,
                }}
              >
                {expandedList[i] && (
                  <>
                    {!isModule && (
                      <>
                        <ContentRow
                          title="Account Address:"
                          value={
                            <HashButton
                              hash={event.guid.account_address}
                              type={HashType.ACCOUNT}
                            />
                          }
                        />
                        <ContentRow
                          title="Creation Number:"
                          value={event.guid.creation_number}
                        />
                        <ContentRow
                          title="Sequence Number:"
                          value={event.sequence_number}
                        />
                      </>
                    )}
                    <ContentRow title="Type:" value={event.type} />
                    <ContentRow
                      title="Data:"
                      value={
                        canDisplayIdentifiedEventData(event.data) ? (
                          <IdentifiedEventData
                            eventType={event.type}
                            data={event.data}
                          />
                        ) : (
                          <JsonViewCard
                            data={
                              typeof event.data == "object"
                                ? event.data
                                : {__PLACEHOLDER__: event.data}
                            }
                          />
                        )
                      }
                    />

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
                          <JsonViewCard data={event} />
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
