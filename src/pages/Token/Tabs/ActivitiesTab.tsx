import React from "react";
import {ActivitiesTable} from "../Component/ActivitiesTable";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {useSearchParams} from "react-router-dom";
import {Box, Pagination, Stack} from "@mui/material";
import {
  useGetTokenActivities,
  useGetTokenActivitiesCount,
} from "../../../api/hooks/useGetAccountTokens";

const LIMIT = 20;

function RenderPagination({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    searchParams.set("page", newPageNum.toString());
    setSearchParams(searchParams);
  };

  return (
    <Pagination
      sx={{mt: 3}}
      count={numPages}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      shape="rounded"
      onChange={handleChange}
    />
  );
}

type TokenActivitiesWithPaginationProps = {
  tokenId: string;
  numPages: number;
};

export function TokenActivitiesWithPagination({
  tokenId,
  numPages,
}: TokenActivitiesWithPaginationProps) {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * LIMIT;

  const {data: activities} = useGetTokenActivities(tokenId, LIMIT, offset);

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "100%"}}>
          <ActivitiesTable activities={activities ?? []} />
        </Box>
        {numPages > 1 && (
          <Box sx={{display: "flex", justifyContent: "center"}}>
            <RenderPagination currentPage={currentPage} numPages={numPages} />
          </Box>
        )}
      </Stack>
    </>
  );
}

import {Current_Token_Datas_V2} from "aptos";

type ActivitiesTabProps = {
  data: Current_Token_Datas_V2;
};

export default function ActivitiesTab({
  data: activitiesData,
}: ActivitiesTabProps) {
  const tokenId = activitiesData?.token_data_id;
  const {data: activitiesCount} = useGetTokenActivitiesCount(tokenId);

  if (activitiesCount === undefined || !tokenId) {
    return <EmptyTabContent />;
  }

  const numPages = Math.ceil(activitiesCount / LIMIT);

  return (
    <TokenActivitiesWithPagination tokenId={tokenId} numPages={numPages} />
  );
}
