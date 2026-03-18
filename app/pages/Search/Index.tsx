import {Stack, Typography} from "@mui/material";
import {useSearch} from "../../routing";
import SearchWithResults from "./SearchWithResults";

export default function SearchPage() {
  const rawSearch = useSearch({strict: false}) as {q?: string};
  const initialQuery = rawSearch.q ?? "";

  return (
    <Stack spacing={3} sx={{maxWidth: 800, mx: "auto", pb: 6}}>
      <div>
        <Typography variant="h3" component="h1" sx={{mb: 0.5, fontWeight: 700}}>
          Search
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find accounts, transactions, blocks, coins, and tokens
        </Typography>
      </div>
      <SearchWithResults initialQuery={initialQuery} updateUrl={true} />
    </Stack>
  );
}
