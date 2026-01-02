import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, formatTimestampLocal} from "../utils";

export const Route = createFileRoute("/blocks")({
  head: () => ({
    meta: [
      {title: "Blocks | Aptos Explorer"},
      {
        name: "description",
        content: "View recent blocks on the Aptos blockchain.",
      },
      {property: "og:title", content: "Blocks | Aptos Explorer"},
      {
        property: "og:description",
        content: "View recent blocks on the Aptos blockchain.",
      },
      {property: "og:url", content: `${BASE_URL}/blocks`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Blocks | Aptos Explorer"},
      {
        name: "twitter:description",
        content: "View recent blocks on the Aptos blockchain.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/blocks`}],
  }),
  component: BlocksPage,
});

function BlocksPage() {
  const {sdk_v2_client} = useGlobalState();

  const {data: ledgerInfo} = useQuery({
    queryKey: ["ledgerInfo"],
    queryFn: () => sdk_v2_client.getLedgerInfo(),
    staleTime: 5000,
  });

  const currentBlockHeight = ledgerInfo?.block_height
    ? Number(ledgerInfo.block_height)
    : 0;

  const {data: blocks, isLoading} = useQuery({
    queryKey: ["blocks", currentBlockHeight],
    queryFn: async () => {
      if (!currentBlockHeight) return [];

      const blockPromises = [];
      for (let i = 0; i < 20; i++) {
        const height = currentBlockHeight - i;
        if (height >= 0) {
          blockPromises.push(
            sdk_v2_client.getBlockByHeight({
              blockHeight: height,
              options: {withTransactions: false},
            }),
          );
        }
      }
      return Promise.all(blockPromises);
    },
    enabled: currentBlockHeight > 0,
    staleTime: 5000,
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{mb: 4}}>
        Blocks
      </Typography>

      {ledgerInfo && (
        <Box sx={{mb: 3}}>
          <Typography variant="body2" color="text.secondary">
            Latest Block Height: {currentBlockHeight.toLocaleString()}
          </Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block Height</TableCell>
              <TableCell>Epoch</TableCell>
              <TableCell>Proposer</TableCell>
              <TableCell>First Version</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({length: 10}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                </TableRow>
              ))
            ) : blocks ? (
              blocks.map((block) => (
                <TableRow key={block.block_height} hover>
                  <TableCell>
                    <Link
                      to="/block/$height"
                      params={{height: block.block_height}}
                      style={{textDecoration: "none"}}
                    >
                      {Number(block.block_height).toLocaleString()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {"block_metadata" in block && block.block_metadata
                      ? (block.block_metadata as {epoch?: string}).epoch
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {"block_metadata" in block && block.block_metadata ? (
                      <Link
                        to="/account/$address"
                        params={{
                          address:
                            (block.block_metadata as {proposer?: string})
                              .proposer || "",
                        }}
                        style={{textDecoration: "none"}}
                      >
                        {truncateAddress(
                          (block.block_metadata as {proposer?: string})
                            .proposer || "",
                        )}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/txn/$txnHashOrVersion"
                      params={{txnHashOrVersion: block.first_version}}
                      style={{textDecoration: "none"}}
                    >
                      {block.first_version}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {"block_metadata" in block && block.block_metadata
                      ? formatTimestampLocal(
                          (block.block_metadata as {timestamp?: string})
                            .timestamp || 0,
                        )
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No blocks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
