import {Box, Pagination, Stack} from "@mui/material";
import type React from "react";
import type {Types} from "~/types/aptos";
import {
  useGetAccountTokens,
  useGetAccountTokensCount,
} from "../../../api/hooks/useGetAccountTokens";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {useSearchParams} from "../../../routing";
import {TokensTable} from "../Components/TokensTable";

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
    _event: React.ChangeEvent<unknown>,
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

type AccountTokensWithPaginationProps = {
  address: string;
  numPages: number;
};

export function AccountTokensWithPagination({
  address,
  numPages,
}: AccountTokensWithPaginationProps) {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const offset = (currentPage - 1) * LIMIT;

  const {data: tokens} = useGetAccountTokens(address, LIMIT, offset);
  return (
    <Stack spacing={2}>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <TokensTable tokens={tokens ?? []} />
      </Box>
      {numPages > 1 && (
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <RenderPagination currentPage={currentPage} numPages={numPages} />
        </Box>
      )}
    </Stack>
  );
}

type TokenTabsProps = {
  address: string;
  accountData: Types.AccountData | Types.MoveResource[] | undefined;
};

export default function TokenTabs({address}: TokenTabsProps) {
  const {data: tokenCount} = useGetAccountTokensCount(address);

  if (tokenCount === undefined) {
    return <EmptyTabContent />;
  }

  const numPages = Math.ceil(tokenCount / LIMIT);
  return <AccountTokensWithPagination address={address} numPages={numPages} />;
}
