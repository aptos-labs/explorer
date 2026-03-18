import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Table,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import {TransactionTypeName} from "../../../components/TransactionType";
import {Link} from "../../../routing";
import {AIP141_CONFIG, wouldExceedGasLimit} from "../../../utils/aip140";
import TransactionFunction from "../../Transaction/Tabs/Components/TransactionFunction";
import {
  getPageStartSequenceNumbers,
  TXN_PER_PAGE,
} from "../Components/AccountTransactions";
import AccountError from "../Error";

type GasImpactRowProps = {
  transaction: Types.Transaction;
};

function GasImpactRow({transaction}: GasImpactRowProps) {
  const theme = useTheme();

  if (transaction.type !== TransactionTypeName.User) return null;
  const userTxn = transaction as Types.Transaction_UserTransaction;

  const gasUsed = BigInt(userTxn.gas_used);
  const projected = gasUsed * AIP141_CONFIG.gasMultiplier;
  const exceeds = wouldExceedGasLimit(
    userTxn.gas_used,
    userTxn.max_gas_amount,
    userTxn.version,
  );

  return (
    <GeneralTableRow to={`/txn/${userTxn.version}`}>
      <GeneralTableCell>
        <Link to={`/txn/${userTxn.version}`} color="primary" underline="none">
          {userTxn.version}
        </Link>
      </GeneralTableCell>
      <GeneralTableCell
        sx={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <TransactionFunction
          transaction={transaction}
          sx={{maxWidth: {xs: 150, md: 250}}}
        />
      </GeneralTableCell>
      <GeneralTableCell sx={{textAlign: "right"}}>
        <GasValue gas={userTxn.gas_used} />
      </GeneralTableCell>
      <GeneralTableCell sx={{textAlign: "right"}}>
        <Typography
          component="span"
          sx={{
            color: exceeds ? theme.palette.warning.main : "inherit",
            fontWeight: exceeds ? 600 : 400,
          }}
        >
          <GasValue gas={projected.toString()} />
        </Typography>
      </GeneralTableCell>
      <GeneralTableCell sx={{textAlign: "right"}}>
        <GasValue gas={userTxn.max_gas_amount} />
      </GeneralTableCell>
      <GeneralTableCell sx={{textAlign: "center"}}>
        {exceeds ? (
          <Tooltip title="Would exceed max gas limit">
            <Box
              component="span"
              tabIndex={0}
              aria-label="Gas usage would exceed the maximum gas limit"
            >
              <WarningAmberIcon
                sx={{color: theme.palette.warning.main}}
                aria-hidden
              />
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="Within gas limit">
            <Box
              component="span"
              tabIndex={0}
              aria-label="Gas usage is within the maximum gas limit"
            >
              <CheckCircleOutlineIcon
                sx={{color: theme.palette.success.main}}
                aria-hidden
              />
            </Box>
          </Tooltip>
        )}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

type GasImpactTableProps = {
  address: string;
  sequenceNum: number;
};

function GasImpactTable({address, sequenceNum}: GasImpactTableProps) {
  const [currentPageNum, setCurrentPageNum] = React.useState(1);
  const numOfPages = Math.ceil(sequenceNum / TXN_PER_PAGE);
  const pageStarts = getPageStartSequenceNumbers(sequenceNum);

  const start = pageStarts[currentPageNum - 1];
  const limit =
    currentPageNum > 1 && currentPageNum === numOfPages
      ? pageStarts[currentPageNum - 2]
      : TXN_PER_PAGE;

  const {isLoading, data, error} = useGetAccountTransactions(
    address,
    start,
    limit,
  );

  if (error) {
    return <AccountError address={address} error={error} />;
  }

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  const userTxns =
    data?.filter((t) => t.type === TransactionTypeName.User) ?? [];
  const affectedCount = userTxns.filter((t) => {
    const ut = t as Types.Transaction_UserTransaction;
    return wouldExceedGasLimit(ut.gas_used, ut.max_gas_amount, ut.version);
  }).length;

  return (
    <>
      {userTxns.length > 0 && (
        <Alert
          severity={affectedCount > 0 ? "warning" : "success"}
          sx={{mb: 2}}
        >
          {affectedCount} of {userTxns.length} transactions on this page would
          exceed their max gas limit under AIP-141 (10x gas costs).
        </Alert>
      )}

      {userTxns.length === 0 ? (
        <EmptyTabContent />
      ) : (
        <Box sx={{overflowX: "auto"}}>
          <Table>
            <TableHead>
              <TableRow>
                <GeneralTableHeaderCell header="Version" />
                <GeneralTableHeaderCell header="Function" />
                <GeneralTableHeaderCell header="Gas Used" textAlignRight />
                <GeneralTableHeaderCell
                  header="Projected (10x)"
                  textAlignRight
                />
                <GeneralTableHeaderCell header="Max Gas Limit" textAlignRight />
                <GeneralTableHeaderCell
                  header="Status"
                  sx={{textAlign: "center"}}
                />
              </TableRow>
            </TableHead>
            <GeneralTableBody>
              {userTxns.map((txn) => (
                <GasImpactRow key={txn.hash} transaction={txn} />
              ))}
            </GeneralTableBody>
          </Table>
        </Box>
      )}

      {numOfPages > 1 && (
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <Pagination
            sx={{mt: 3}}
            count={numOfPages}
            variant="outlined"
            showFirstButton
            showLastButton
            page={currentPageNum}
            siblingCount={4}
            boundaryCount={0}
            shape="rounded"
            onChange={(_e, page) => setCurrentPageNum(page)}
          />
        </Box>
      )}
    </>
  );
}

type GasImpactTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function GasImpactTab({
  address,
  accountData,
}: GasImpactTabProps) {
  if (!accountData) {
    return <EmptyTabContent />;
  }

  return (
    <GasImpactTable
      address={address}
      sequenceNum={parseInt(accountData.sequence_number, 10)}
    />
  );
}
