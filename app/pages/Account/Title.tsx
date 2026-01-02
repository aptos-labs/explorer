import {Box, Link, Stack, Typography} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TitleHashButton, {
  HashType,
  NameType,
} from "../../components/TitleHashButton";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import StyledTooltip from "../../components/StyledTooltip";
import {useIsDaaAccount} from "./hooks/useIsDaaAccount";

type AccountTitleProps = {
  address: string;
  isMultisig?: boolean;
  isObject?: boolean;
  isDeleted?: boolean;
  isToken?: boolean;
};

export default function AccountTitle({
  address,
  isMultisig = false,
  isToken = false,
  isObject = false,
  isDeleted = false,
}: AccountTitleProps) {
  const isDAA = useIsDaaAccount(address);

  let title = "Account";
  let description = `View details for Aptos account ${address}. See transactions, resources, modules, coins, and NFTs owned by this account.`;

  if (isMultisig) {
    title = "Multisig Account";
    description = `View details for Aptos multisig account ${address}. See pending transactions, owners, and multisig configuration.`;
  } else if (isToken) {
    if (isDeleted) {
      title = "Deleted Token Object";
      description = `This token object ${address} has been deleted from the Aptos blockchain.`;
    } else {
      title = `Token Object`;
      description = `View token object ${address} on the Aptos blockchain. See token metadata, ownership, and transfer history.`;
    }
  } else if (isObject) {
    if (isDeleted) {
      title = "Deleted Object";
      description = `This object ${address} has been deleted from the Aptos blockchain.`;
    } else {
      title = "Object";
      description = `View object ${address} on the Aptos blockchain. See object resources, ownership, and associated data.`;
    }
  } else if (isDAA) {
    title = "Derivable Aptos Account";
    description = `View derivable Aptos account ${address}. Cross-chain account derived from another blockchain address.`;
  }

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata title={`${title} ${address}`} description={description} />
      <Typography variant="h3">{title}</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.ACCOUNT} />
        <TitleHashButton
          hash={address}
          type={HashType.NAME}
          nameType={NameType.LABEL}
        />
        <TitleHashButton
          hash={address}
          type={HashType.NAME}
          nameType={NameType.ANS}
        />
      </Stack>
      {isDAA && (
        <Box sx={{mb: 4}}>
          <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
            <Typography variant="body1">
              This is a Derivable Aptos Account
            </Typography>
            <StyledTooltip
              title={
                // Put your tooltip content here
                <Typography variant="body2">
                  Learn more about
                  <Link
                    href="https://aptos.dev/build/sdks/wallet-adapter/x-chain-accounts"
                    target="_blank"
                    underline="none"
                  >
                    <Typography variant="body2" sx={{fontWeight: 600}}>
                      Derivable Aptos Accounts
                    </Typography>
                  </Link>
                </Typography>
              }
              arrow
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: "info.main",
                  cursor: "help",
                }}
              />
            </StyledTooltip>
          </Box>
          <Stack spacing={1}>
            <Typography variant="body1">
              To get more insights on your derivable aptos accounts, please
              visit the
            </Typography>
            <Link
              href="https://daa-dashboard.vercel.app/"
              target="_blank"
              underline="none"
            >
              <Typography variant="body2" sx={{fontWeight: 600}}>
                Derivable Aptos Account Dashboard
              </Typography>
            </Link>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
