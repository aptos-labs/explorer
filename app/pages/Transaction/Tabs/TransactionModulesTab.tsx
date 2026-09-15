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
import {useTranslation} from "../../../i18n";
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
  const {t} = useTranslation();
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
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontFamily: "monospace",
            }}
          >
            PublishPackage
          </Typography>{" "}
          events. Module installs and removals come from{" "}
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontFamily: "monospace",
            }}
          >
            write_module
          </Typography>{" "}
          and{" "}
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontFamily: "monospace",
            }}
          >
            delete_module
          </Typography>{" "}
          write-set changes (same source as the Changes tab).
        </Typography>
      </Alert>
      {publishPackageEvents.length > 0 && (
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <ViewModuleOutlinedIcon fontSize="small" color="action" />
            <Typography variant="h6" component="h2">
              {t("txnModules.packagePublish")}
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("txnModules.codeAddress")}</TableCell>
                <TableCell width={160}>{t("txnModules.kind")}</TableCell>
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
                      label={
                        row.isUpgrade
                          ? t("txnModules.upgrade")
                          : t("txnModules.newPublish")
                      }
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
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <ViewModuleOutlinedIcon fontSize="small" color="action" />
            <Typography variant="h6" component="h2">
              {t("txnModules.bytecodeChanges")}
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={120}>{t("txnModules.change")}</TableCell>
                <TableCell>{t("txnModules.address")}</TableCell>
                <TableCell>{t("txnModules.module")}</TableCell>
                <TableCell width={100} align="right">
                  {t("txnModules.explorer")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moduleChanges.map((row) => (
                <TableRow key={`${row.kind}:${row.address}:${row.moduleName}`}>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        row.kind === "write_module"
                          ? t("txnModules.write")
                          : t("txnModules.delete")
                      }
                      color={row.kind === "write_module" ? "primary" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <HashButton hash={row.address} type={HashType.ACCOUNT} />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                      }}
                    >
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
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
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
