import {InfoOutlined} from "@mui/icons-material";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import {
  Alert,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type React from "react";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../components/HashButton";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Link} from "../../../routing";
import {tryStandardizeAddress} from "../../../utils";
import {getTransactionModuleSummary} from "../transactionModuleChanges";

type TransactionModulesTabProps = {
  transaction: Types.Transaction;
};

function moduleCodePath(address: string, moduleName: string): string {
  const std = tryStandardizeAddress(address) ?? address;
  return `/account/${std}/modules/code/${encodeURIComponent(moduleName)}`;
}

export default function TransactionModulesTab({
  transaction,
}: TransactionModulesTabProps): React.JSX.Element {
  const summary = getTransactionModuleSummary(transaction);

  if (!summary) {
    return <EmptyTabContent />;
  }

  const {publishPackageEvents, moduleChanges} = summary;

  return (
    <Stack spacing={3} sx={{mt: 2}}>
      <Alert severity="info" icon={<InfoOutlined />}>
        <Typography variant="body2" component="span">
          Package publishes are inferred from{" "}
          <Typography component="span" variant="body2" fontFamily="monospace">
            PublishPackage
          </Typography>{" "}
          events. Module installs and removals come from{" "}
          <Typography component="span" variant="body2" fontFamily="monospace">
            write_module
          </Typography>{" "}
          and{" "}
          <Typography component="span" variant="body2" fontFamily="monospace">
            delete_module
          </Typography>{" "}
          write-set changes (same source as the Changes tab).
        </Typography>
      </Alert>

      {publishPackageEvents.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1.5}}>
            <ViewModuleOutlinedIcon fontSize="small" color="action" />
            <Typography variant="h6" component="h2">
              Package publish
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code address</TableCell>
                <TableCell width={160}>Kind</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {publishPackageEvents.map((row) => (
                <TableRow
                  key={`publish:${row.codeAddress}:${String(row.isUpgrade)}`}
                >
                  <TableCell>
                    <HashButton
                      hash={row.codeAddress}
                      type={HashType.ACCOUNT}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.isUpgrade ? "Upgrade" : "New publish"}
                      color={row.isUpgrade ? "warning" : "success"}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {moduleChanges.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1.5}}>
            <ViewModuleOutlinedIcon fontSize="small" color="action" />
            <Typography variant="h6" component="h2">
              Module bytecode changes
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={120}>Change</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Module</TableCell>
                <TableCell width={100} align="right">
                  Explorer
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moduleChanges.map((row) => (
                <TableRow key={`${row.kind}:${row.address}:${row.moduleName}`}>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.kind === "write_module" ? "Write" : "Delete"}
                      color={row.kind === "write_module" ? "primary" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <HashButton hash={row.address} type={HashType.ACCOUNT} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {row.moduleName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {row.kind === "write_module" &&
                    row.moduleName !== "(module name unavailable)" ? (
                      <Link
                        to={moduleCodePath(row.address, row.moduleName)}
                        underline="hover"
                      >
                        Code
                      </Link>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}
