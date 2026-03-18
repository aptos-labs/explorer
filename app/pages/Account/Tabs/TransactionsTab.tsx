import {FormControlLabel, Stack, Switch} from "@mui/material";
import type {Types} from "~/types/aptos";
import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {
  AIP140Provider,
  useAIP140Warnings,
} from "../../../context/AIP140Context";
import {AIP141_CONFIG} from "../../../utils/aip140";
import AccountAllTransactions from "../Components/AccountAllTransactions";
import AccountTransactions from "../Components/AccountTransactions";

function AIP140Toggle() {
  const {showWarnings, setShowWarnings} = useAIP140Warnings();

  if (!AIP141_CONFIG.enabled) return null;

  return (
    <Stack direction="row" justifyContent="flex-end" sx={{mb: 1}}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={showWarnings}
            onChange={(e) => setShowWarnings(e.target.checked)}
          />
        }
        label="AIP-141 Gas Impact"
        slotProps={{typography: {variant: "body2"}}}
      />
    </Stack>
  );
}

type TransactionsTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
};

export default function TransactionsTab({
  address,
  accountData,
}: TransactionsTabProps) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  // AccountTransactions: render transactions where the account is the sender
  // AccountAllTransactions: render all transactions where the account is involved
  const content = !accountData ? (
    isGraphqlClientSupported ? (
      <AccountAllTransactions address={address} />
    ) : (
      <EmptyTabContent />
    )
  ) : isGraphqlClientSupported ? (
    <AccountAllTransactions address={address} />
  ) : (
    <AccountTransactions address={address} accountData={accountData} />
  );

  return (
    <AIP140Provider>
      <AIP140Toggle />
      {content}
    </AIP140Provider>
  );
}
