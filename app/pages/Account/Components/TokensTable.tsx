import * as React from "react";
import {useMemo} from "react";
import {Box, Typography, Paper, Stack, useMediaQuery} from "@mui/material";
import {Table, TableHead, TableRow, useTheme} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../utils";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import VirtualizedTableBody from "../../../components/Table/VirtualizedTableBody";
import {
  Link,
  useNavigate,
  useAugmentToWithGlobalSearchParams,
} from "../../../routing";
import {TokenOwnership} from "../../../api/hooks/useGetAccountTokens";
import {labsBannedCollections} from "../../../constants";
import {Dangerous} from "@mui/icons-material";
import StyledTooltip from "../../../components/StyledTooltip";

type TokenCellProps = {
  token: TokenOwnership;
};

function TokenNameCell({token}: TokenCellProps) {
  let badge = null;
  const reason =
    labsBannedCollections[token?.current_token_data?.collection_id ?? ""];
  if (reason) {
    let tooltipMessage = `This asset has been marked as a scam or dangerous, please avoid using this asset.`;
    tooltipMessage += ` Reason: (${reason})`;
    badge = (
      <StyledTooltip title={tooltipMessage}>
        <Dangerous fontSize="small" color="error" />
      </StyledTooltip>
    );
  }

  const propertyVersion = token?.property_version_v1;
  const tokenDataId = token?.current_token_data?.token_data_id;
  const linkTo = propertyVersion
    ? `/token/${tokenDataId}?propertyVersion=${propertyVersion}`
    : `/token/${tokenDataId}`;

  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link to={linkTo} color="primary">
        <Box
          sx={{
            maxWidth: {xs: 150, md: 250, lg: 400},
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {token?.current_token_data?.token_name}
          {/* Show warning for banned collections */}
          {badge}
        </Box>
      </Link>
    </GeneralTableCell>
  );
}

// TODO: link to collection page
function CollectionNameCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: {xs: 150, md: 250, lg: 400},
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {token?.current_token_data?.current_collection?.collection_name}
    </GeneralTableCell>
  );
}

function StoreCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: {xs: 150, md: 250, lg: 400},
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {token?.table_type_v1}
    </GeneralTableCell>
  );
}

function PropertyVersionCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.property_version_v1}
    </GeneralTableCell>
  );
}

function AmountCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.amount}
    </GeneralTableCell>
  );
}

function TypeCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.token_standard}
    </GeneralTableCell>
  );
}

const TokenCells = Object.freeze({
  name: TokenNameCell,
  collectionName: CollectionNameCell,
  store: StoreCell,
  propertyVersion: PropertyVersionCell,
  type: TypeCell,
  amount: AmountCell,
});

// Mobile card component for tokens
function TokenCard({token}: {token: TokenOwnership}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();

  const propertyVersion = token?.property_version_v1;
  const tokenDataId = token?.current_token_data?.token_data_id;
  const linkTo = propertyVersion
    ? `/token/${tokenDataId}?propertyVersion=${propertyVersion}`
    : `/token/${tokenDataId}`;

  const reason =
    labsBannedCollections[token?.current_token_data?.collection_id ?? ""];

  const handleClick = () => {
    if (tokenDataId) {
      navigate({to: augmentTo(linkTo)});
    }
  };

  return (
    <Paper
      onClick={handleClick}
      sx={{
        px: 2,
        py: 1.5,
        mb: 1,
        cursor: "pointer",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        "&:hover": {
          filter:
            theme.palette.mode === "dark"
              ? "brightness(0.9)"
              : "brightness(0.99)",
        },
        "&:active": {
          background: theme.palette.neutralShade.main,
          transform: "translate(0,0.1rem)",
        },
      }}
    >
      {/* Row 1: Token Name, Type badge, Warning if banned */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mb: 0.75}}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{flex: 1, minWidth: 0}}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "primary.main",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {token?.current_token_data?.token_name}
          </Typography>
          {reason && (
            <StyledTooltip
              title={`This asset has been marked as a scam or dangerous. Reason: (${reason})`}
            >
              <Dangerous fontSize="small" color="error" />
            </StyledTooltip>
          )}
        </Stack>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            flexShrink: 0,
            backgroundColor: theme.palette.action.hover,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.7rem",
          }}
        >
          {token?.token_standard}
        </Typography>
      </Stack>

      {/* Row 2: Collection, Amount */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: "text.secondary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            mr: 2,
          }}
        >
          {token?.current_token_data?.current_collection?.collection_name}
        </Typography>
        <Typography sx={{fontSize: "0.85rem", flexShrink: 0}}>
          {token?.amount}
        </Typography>
      </Stack>
    </Paper>
  );
}

type Column = keyof typeof TokenCells;

const DEFAULT_COLUMNS: Column[] = [
  "name",
  "collectionName",
  "store",
  "propertyVersion",
  "type",
  "amount",
];

type TokenRowProps = {
  token: TokenOwnership;
  columns: Column[];
};

function TokenRow({token, columns}: TokenRowProps) {
  const propertyVersion = token?.property_version_v1;
  const tokenDataId = token?.current_token_data?.token_data_id;
  const linkTo = propertyVersion
    ? `/token/${tokenDataId}?propertyVersion=${propertyVersion}`
    : `/token/${tokenDataId}`;

  return (
    <GeneralTableRow to={linkTo}>
      {columns.map((column) => {
        const Cell = TokenCells[column];
        return <Cell key={column} token={token} />;
      })}
    </GeneralTableRow>
  );
}

type TokenHeaderCellProps = {
  column: Column;
};

function TokenHeaderCell({column}: TokenHeaderCellProps) {
  switch (column) {
    case "name":
      return <GeneralTableHeaderCell header="Name" />;
    case "collectionName":
      return <GeneralTableHeaderCell header="Collection" />;
    case "store":
      return <GeneralTableHeaderCell header="Store" />;
    case "propertyVersion":
      return <GeneralTableHeaderCell header="Version" textAlignRight />;
    case "type":
      return <GeneralTableHeaderCell header="Type" textAlignRight />;
    case "amount":
      return <GeneralTableHeaderCell header="Amount" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type TokensTableProps = {
  tokens: TokenOwnership[];
  columns?: Column[];
};

export function TokensTable({
  tokens,
  columns = DEFAULT_COLUMNS,
}: TokensTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Memoize token rows for virtualization
  const tokenRows = useMemo(
    () =>
      tokens.map((token, i: number) => (
        <TokenRow key={i} token={token} columns={columns} />
      )),
    [tokens, columns],
  );

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {tokens.length > 0 ? (
          tokens.map((token, i) => <TokenCard key={i} token={token} />)
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{textAlign: "center", py: 3}}
          >
            No tokens found
          </Typography>
        )}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box sx={{overflowX: "auto"}}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TokenHeaderCell key={column} column={column} />
            ))}
          </TableRow>
        </TableHead>
        {tokens.length > 0 ? (
          <VirtualizedTableBody
            estimatedRowHeight={60}
            virtualizationThreshold={15}
          >
            {tokenRows}
          </VirtualizedTableBody>
        ) : (
          <GeneralTableBody>
            <TableRow>
              <GeneralTableCell
                colSpan={columns.length}
                sx={{textAlign: "center", py: 3}}
              >
                <Typography variant="body1" color="text.secondary">
                  No tokens found
                </Typography>
              </GeneralTableCell>
            </TableRow>
          </GeneralTableBody>
        )}
      </Table>
    </Box>
  );
}
