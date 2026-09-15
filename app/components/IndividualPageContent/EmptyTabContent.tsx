import {Box} from "@mui/material";
import type React from "react";
import {useTranslation} from "../../i18n";
import ContentBox from "./ContentBox";

type EmptyTabContentProps = {
  message?: React.ReactNode;
};

export default function EmptyTabContent({message}: EmptyTabContentProps) {
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox>{message ?? t("common.noDataFound")}</ContentBox>
    </Box>
  );
}
