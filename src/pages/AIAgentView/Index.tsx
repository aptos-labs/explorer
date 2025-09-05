import {Box, Typography} from "@mui/material";
import * as React from "react";
import PageHeader from "../layout/PageHeader";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

export default function AIAgentViewPage() {
  usePageMetadata({title: "AI Agent View"});
  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        AI Agent View
      </Typography>
      <Typography>Coming Soon — Agent Behavior Viewer.</Typography>
    </Box>
  );
}
