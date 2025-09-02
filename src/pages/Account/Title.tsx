import {Stack, Typography} from "@mui/material";
import React from "react";
import TitleHashButton, {
  HashType,
  NameType,
} from "../../components/TitleHashButton";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

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
  let title = "Account";
  if (isMultisig) {
    title = "Multisig Account";
  } else if (isToken) {
    if (isDeleted) {
      title = "Deleted Token Object";
    } else {
      title = `Token Object`;
    }
  } else if (isObject) {
    if (isDeleted) {
      title = "Deleted Object";
    } else {
      title = "Object";
    }
  }

  usePageMetadata({title: `${title} ${address}`});

  return (
    <Stack direction="column" spacing={2} marginX={1}>
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
    </Stack>
  );
}
