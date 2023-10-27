import {ApolloError} from "@apollo/client";
import {Alert} from "@mui/material";

type ErrorProps = {
  error: ApolloError;
  txnHashOrVersion: string;
};

export default function Error({error, txnHashOrVersion}: ErrorProps) {
  return (
    <Alert severity="error">
      Unknown error fetching transaction with version or hash {txnHashOrVersion}
      :<br />
      {error.message}
      <br />
      Try again later
    </Alert>
  );
}
