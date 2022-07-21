import React,{ useEffect, useState }  from "react";
import { Stack, Divider } from "@mui/material";
import {
    renderRow,
    renderSection,
} from "../../../pages/Transactions/helpers";
import { ProposalType } from "../Types";

function RenderContent(children: React.ReactNode) {
    return renderSection(children, null);
}

type Props = {
    proposalData: ProposalType;
};

export function ProposalContent({
    proposalData,
}: Props) {
    if (!proposalData) {
        return null;
    }

    const [metadata, setMetadata] = useState<any>(null);

    useEffect(() => {
        const {metadata_location} = proposalData.execution_content;
    
        const fetchMetadata = async () => {
          try {
            const response = await fetch(metadata_location);
            const json = await response.json();
            setMetadata(json);
          } catch (error) {
            // TODO: error handling
            console.log("error", error);
          }
        };
    
        fetchMetadata();
    }, []);

    return (
        RenderContent(
            <Stack
                direction="column"
                spacing={2}
                divider={
                    < Divider variant="dotted" orientation="horizontal" sx={{ mb: 0 }} />
                }
            >
                {renderRow(
                        "Proposal Hash:",
                        proposalData.execution_hash,
                    )}
                {renderRow(
                        "Proposal Script",
                        metadata?.execution_script,
                    )}
                {renderRow(
                        "Description:",
                        metadata?.description,
                    )}
            </Stack >
        )
    );
}