import {Box, Skeleton, Stack, Table, TableHead, TableRow} from "@mui/material";
import type {ReactNode} from "react";
import {Card} from "./Card";
import ContentBox from "./IndividualPageContent/ContentBox";
import GeneralTableBody from "./Table/GeneralTableBody";
import GeneralTableCell from "./Table/GeneralTableCell";
import GeneralTableRow from "./Table/GeneralTableRow";

function pulseSx(delayMs = 0) {
  return {
    animationDelay: `${delayMs}ms`,
  };
}

export function TabStripSkeleton({count = 6}: {count?: number}) {
  return (
    <Stack
      direction="row"
      spacing={0}
      sx={{width: "100%", overflow: "hidden"}}
      aria-hidden
    >
      {Array.from({length: count}, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <Skeleton
          key={i}
          variant="rounded"
          height={48}
          sx={{
            flex: 1,
            maxWidth: {md: 200},
            borderRadius: 0,
            ...pulseSx(i * 60),
          }}
        />
      ))}
    </Stack>
  );
}

export function BalanceCardSkeleton() {
  return (
    <Card sx={{height: "auto"}} aria-busy="true" aria-label="Loading balance">
      <Stack spacing={1.5} sx={{marginY: 1}}>
        <Skeleton variant="text" width="55%" height={28} />
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="30%" height={16} />
      </Stack>
    </Card>
  );
}

export function TitleHashSkeleton() {
  return (
    <Stack direction="row" spacing={1} aria-hidden>
      <Skeleton variant="rounded" width={220} height={36} />
      <Skeleton variant="rounded" width={120} height={36} />
    </Stack>
  );
}

export function ContentRowsSkeleton({rows = 8}: {rows?: number}) {
  return (
    <ContentBox aria-busy="true" aria-label="Loading content">
      {Array.from({length: rows}, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <Stack
          key={i}
          direction={{xs: "column", md: "row"}}
          spacing={2}
          sx={{alignItems: {md: "center"}}}
        >
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton
            variant="text"
            width="70%"
            height={24}
            sx={pulseSx(i * 40)}
          />
        </Stack>
      ))}
    </ContentBox>
  );
}

export function ResourcesListSkeleton({cards = 4}: {cards?: number}) {
  return (
    <Stack
      spacing={2}
      sx={{mt: 2}}
      aria-busy="true"
      aria-label="Loading resources"
    >
      {Array.from({length: cards}, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <Skeleton
          key={i}
          variant="rounded"
          height={72}
          sx={{borderRadius: 1, ...pulseSx(i * 80)}}
        />
      ))}
    </Stack>
  );
}

export function TransactionRowSkeleton({
  columnCount = 7,
}: {
  columnCount?: number;
}) {
  return (
    <GeneralTableRow>
      {Array.from({length: columnCount}, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <GeneralTableCell key={i}>
          <Skeleton variant="text" width="80%" sx={pulseSx(i * 30)} />
        </GeneralTableCell>
      ))}
    </GeneralTableRow>
  );
}

export function TransactionsTableSkeleton({
  columnCount = 7,
  rowCount = 8,
  headers,
}: {
  columnCount?: number;
  rowCount?: number;
  headers?: ReactNode;
}) {
  return (
    <Box sx={{width: "auto", overflowX: "auto"}} aria-busy="true">
      <Table aria-label="Loading transactions">
        {headers ? (
          <TableHead>
            <TableRow>{headers}</TableRow>
          </TableHead>
        ) : null}
        <GeneralTableBody>
          {Array.from({length: rowCount}, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <TransactionRowSkeleton key={i} columnCount={columnCount} />
          ))}
        </GeneralTableBody>
      </Table>
    </Box>
  );
}

export function TransactionCardSkeleton() {
  return (
    <Skeleton variant="rounded" height={88} sx={{mb: 1, borderRadius: 1}} />
  );
}

export function AccountTabPanelSkeleton() {
  return (
    <Box sx={{mt: 2}} aria-busy="true" aria-label="Loading tab">
      <TransactionsTableSkeleton />
    </Box>
  );
}
