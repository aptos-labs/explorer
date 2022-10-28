import React from "react";
import {ActivitiesTable} from "../Component/ActivitiesTable";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {
  useGetTokensActivities,
  useGetTokensActivitiesCount,
} from "../../../api/hooks/useGetTokenActivities";
import {useSearchParams} from "react-router-dom";
import {Box, Pagination, Stack} from "@mui/material";

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
  tokenDataIdHash: string;
  numPages: number;
};

export function TokenActivitiesWithPagination({
  tokenDataIdHash,
  numPages,
}: TokenActivitiesWithPaginationProps) {
  const [searchParams, _setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * LIMIT;

  const activities = useGetTokensActivities(tokenDataIdHash, LIMIT, offset);

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <ActivitiesTable activities={activities} />
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

type ActivitiesTabProps = {
  // TODO: add graphql data typing
  data: any;
};

export default function ActivitiesTab({
  data: activitiesData,
}: ActivitiesTabProps) {
  const activitiesCount = useGetTokensActivitiesCount(
    activitiesData?.token_data_id_hash,
  );

  if (activitiesCount === undefined || !activitiesData?.token_data_id_hash) {
    return <EmptyTabContent />;
  }

  const numPages = Math.ceil(activitiesCount / LIMIT);

  return (
    <TokenActivitiesWithPagination
      tokenDataIdHash={activitiesData?.token_data_id_hash}
      numPages={numPages}
    />
  );
}
