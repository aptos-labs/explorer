import React, {useReducer} from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {
  CoinHolder,
  useGetCoinHolders,
} from "../../../api/hooks/useGetCoinHolders";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {FACombinedData} from "../Index";
import {Box, Button, CircularProgress} from "@mui/material";

type HoldersTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

const LIMIT = 25;

// Wrapper component that remounts HoldersContent when address changes
export default function HoldersTab({address, data}: HoldersTabProps) {
  return <HoldersContent key={address} address={address} data={data} />;
}

type HoldersState = {
  offset: number;
  holders: CoinHolder[];
  lastLoadedOffset: number;
};

type HoldersAction =
  | {type: "LOAD_MORE"}
  | {type: "DATA_LOADED"; payload: {offset: number; data: CoinHolder[]}};

function holdersReducer(state: HoldersState, action: HoldersAction): HoldersState {
  switch (action.type) {
    case "LOAD_MORE":
      return {...state, offset: state.offset + LIMIT};
    case "DATA_LOADED":
      if (action.payload.offset === state.lastLoadedOffset) {
        return state; // Already processed this offset
      }
      if (action.payload.offset === 0) {
        return {
          ...state,
          holders: action.payload.data,
          lastLoadedOffset: 0,
        };
      }
      return {
        ...state,
        holders: [...state.holders, ...action.payload.data],
        lastLoadedOffset: action.payload.offset,
      };
    default:
      return state;
  }
}

function HoldersContent({address, data}: HoldersTabProps) {
  const [state, dispatch] = useReducer(holdersReducer, {
    offset: 0,
    holders: [],
    lastLoadedOffset: -1,
  });

  const holderData = useGetCoinHolders(address, LIMIT, state.offset);

  // Process loaded data via reducer dispatch
  if (
    holderData.data &&
    holderData.data.length > 0 &&
    state.lastLoadedOffset !== state.offset
  ) {
    dispatch({
      type: "DATA_LOADED",
      payload: {offset: state.offset, data: holderData.data},
    });
  }

  // Show loading only on initial load
  if (holderData.isLoading && state.holders.length === 0) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
        <CircularProgress />
      </Box>
    );
  }
  if (!data || Array.isArray(data) || state.holders.length === 0) {
    return <EmptyTabContent />;
  }

  const handleLoadMore = () => {
    dispatch({type: "LOAD_MORE"});
  };

  return (
    <Box>
      <HoldersTable data={data} holders={state.holders} offset={0} />
      {holderData.hasMore && (
        <Box sx={{display: "flex", justifyContent: "center", padding: 2}}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={holderData.isLoading}
            startIcon={
              holderData.isLoading ? <CircularProgress size={16} /> : null
            }
          >
            {holderData.isLoading ? "Loading..." : "Load more"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function HoldersTable({
  data,
  holders,
  offset = 0,
}: {
  holders: CoinHolder[];
  data: FACombinedData;
  offset?: number;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="rank" />
          <GeneralTableHeaderCell header="holder address" />
          <GeneralTableHeaderCell header="amount" textAlignRight={true} />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {holders.map((holder, i) => {
          return (
            <GeneralTableRow key={holder.owner_address}>
              <GeneralTableCell>{offset + i + 1}</GeneralTableCell>
              <GeneralTableCell>
                <HashButton
                  hash={holder.owner_address}
                  type={HashType.ACCOUNT}
                />
              </GeneralTableCell>
              <GeneralTableCell align={"right"}>
                {getFormattedBalanceStr(
                  holder.amount.toString(),
                  data.coinData?.decimals ?? data.metadata?.decimals,
                ) +
                  " " +
                  (data.coinData?.symbol ?? data.metadata?.symbol)}
              </GeneralTableCell>
            </GeneralTableRow>
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
