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
  Chip,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, formatTimestampLocal} from "../utils";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      {title: "Transactions | Aptos Explorer"},
      {
        name: "description",
        content: "View recent transactions on the Aptos blockchain.",
      },
      {property: "og:title", content: "Transactions | Aptos Explorer"},
      {
        property: "og:description",
        content: "View recent transactions on the Aptos blockchain.",
      },
      {property: "og:url", content: `${BASE_URL}/transactions`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Transactions | Aptos Explorer"},
      {
        name: "twitter:description",
        content: "View recent transactions on the Aptos blockchain.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/transactions`}],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const {sdk_v2_client} = useGlobalState();

  const {data: transactions, isLoading} = useQuery({
    queryKey: ["transactions", "latest"],
    queryFn: async () => {
      const response = await sdk_v2_client.getTransactions({
        options: {limit: 25},
      });
      return response;
    },
    staleTime: 10000, // 10 seconds
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{mb: 4}}>
        Transactions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Sender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({length: 10}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions ? (
              transactions.map((tx) => (
                <TableRow key={tx.version} hover>
                  <TableCell>
                    <Link
                      to="/txn/$txnHashOrVersion"
                      params={{txnHashOrVersion: tx.version}}
                      style={{textDecoration: "none"}}
                    >
                      {tx.version}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.type.replace("_transaction", "")}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {"sender" in tx ? (
                      <Link
                        to="/account/$address"
                        params={{address: tx.sender}}
                        style={{textDecoration: "none"}}
                      >
                        {truncateAddress(tx.sender)}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.success ? "Success" : "Failed"}
                      color={tx.success ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {"timestamp" in tx
                      ? formatTimestampLocal(tx.timestamp)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
