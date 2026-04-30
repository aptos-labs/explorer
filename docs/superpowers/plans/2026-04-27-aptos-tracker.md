# Aptos Deployment Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new pages to the Aptos Explorer — `/deployments`, `/aips`, and `/releases` — that show live network status across all three environments, all AIPs with their status, and the latest versions of all official Aptos tools and SDKs.

**Architecture:** Three TanStack Router file-based routes, each backed by a TanStack Query hook. Network data fetches all three environments in parallel using direct `fetch()` calls to fullnode REST endpoints. AIP and release data fetches from GitHub's tree API and public package registries (npm, PyPI, crates.io, Go proxy). All queries use `staleTime` for caching and `queryClient.invalidateQueries` for force-refresh. Tests are colocated with hooks (`.test.ts` suffix), matching the existing pattern in the codebase (e.g. `useGetAccountResource.test.ts`).

**Tech Stack:** TanStack Router, TanStack Query v5, MUI v7, TypeScript, Vitest

**Working directory:** `~/git/explorer`

---

## File Map

### Create
```
app/routes/deployments.tsx
app/routes/aips.tsx
app/routes/releases.tsx
app/pages/Deployments/Index.tsx
app/pages/Deployments/NetworkCard.tsx
app/pages/AIPs/Index.tsx
app/pages/Releases/Index.tsx
app/pages/Releases/ReleaseCard.tsx
app/api/hooks/useGetNetworkStatus.ts
app/api/hooks/useGetNetworkStatus.test.ts
app/api/hooks/useGetAIPs.ts
app/api/hooks/useGetAIPs.test.ts
app/api/hooks/useGetReleases.ts
app/api/hooks/useGetReleases.test.ts
```

### Modify
```
app/components/layout/Nav.tsx        — add 3 NavButton entries
app/components/layout/NavMobile.tsx  — add 3 MenuItem entries
app/routeTree.gen.ts                 — auto-generated, run pnpm routes:generate
```

---

## Task 1: Route files + nav wiring

**Files:**
- Create: `app/routes/deployments.tsx`
- Create: `app/routes/aips.tsx`
- Create: `app/routes/releases.tsx`
- Modify: `app/components/layout/Nav.tsx`
- Modify: `app/components/layout/NavMobile.tsx`

- [ ] **Step 1: Create the three route files**

`app/routes/deployments.tsx`:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PagePending } from "../components/NavigationPending";
import DeploymentsPage from "../pages/Deployments/Index";

export const Route = createFileRoute("/deployments")({
  pendingComponent: PagePending,
  component: DeploymentsPage,
});
```

`app/routes/aips.tsx`:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PagePending } from "../components/NavigationPending";
import AIpsPage from "../pages/AIPs/Index";

export const Route = createFileRoute("/aips")({
  pendingComponent: PagePending,
  component: AIpsPage,
});
```

`app/routes/releases.tsx`:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PagePending } from "../components/NavigationPending";
import ReleasesPage from "../pages/Releases/Index";

export const Route = createFileRoute("/releases")({
  pendingComponent: PagePending,
  component: ReleasesPage,
});
```

- [ ] **Step 2: Create stub page components so routes compile**

`app/pages/Deployments/Index.tsx`:
```typescript
export default function DeploymentsPage() {
  return null;
}
```

`app/pages/AIPs/Index.tsx`:
```typescript
export default function AIpsPage() {
  return null;
}
```

`app/pages/Releases/Index.tsx`:
```typescript
export default function ReleasesPage() {
  return null;
}
```

- [ ] **Step 3: Add nav buttons to `app/components/layout/Nav.tsx`**

Add these three `NavButton` entries after the existing Coins button:
```typescript
      <NavButton
        to="/deployments"
        title="View Network Deployments"
        label="Deployments"
      />
      <NavButton to="/aips" title="View Aptos Improvement Proposals" label="AIPs" />
      <NavButton
        to="/releases"
        title="View SDK & Tool Releases"
        label="Releases"
      />
```

- [ ] **Step 4: Add nav items to `app/components/layout/NavMobile.tsx`**

Add these three `MenuItem` entries after the existing Coins item:
```typescript
        <MenuItem onClick={() => handleCloseAndNavigate("/deployments")}>
          Deployments
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/aips")}>
          AIPs
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/releases")}>
          Releases
        </MenuItem>
```

- [ ] **Step 5: Regenerate route tree**

```bash
cd ~/git/explorer && pnpm routes:generate
```

Expected: `app/routeTree.gen.ts` is updated with `/deployments`, `/aips`, `/releases` entries. No errors.

- [ ] **Step 6: Verify dev server compiles**

```bash
cd ~/git/explorer && pnpm dev
```

Navigate to `http://localhost:3000/deployments`, `/aips`, and `/releases`. Each should render (blank page is fine). Nav bar should show the three new links.

- [ ] **Step 7: Commit**

```bash
cd ~/git/explorer
git add app/routes/deployments.tsx app/routes/aips.tsx app/routes/releases.tsx \
  app/pages/Deployments/Index.tsx app/pages/AIPs/Index.tsx app/pages/Releases/Index.tsx \
  app/components/layout/Nav.tsx app/components/layout/NavMobile.tsx \
  app/routeTree.gen.ts
git commit -m "feat: add deployments, aips, releases routes and nav entries"
```

---

## Task 2: Network status hook

**Files:**
- Create: `app/api/hooks/useGetNetworkStatus.ts`
- Create: `app/api/hooks/useGetNetworkStatus.test.ts`

- [ ] **Step 1: Write the failing test**

`app/api/hooks/useGetNetworkStatus.test.ts`:
```typescript
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchNetworkStatus } from "./useGetNetworkStatus";

const mockLedger = {
  epoch: "100",
  block_height: "5000000",
  ledger_version: "10000000",
  chain_id: 1,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchNetworkStatus", () => {
  it("returns healthy status with all fields populated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLedger),
          });
        }
        if (url.includes("0x1::stake::ValidatorSet")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: { active_validators: new Array(104).fill({}) },
              }),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }),
    );

    const result = await fetchNetworkStatus("mainnet");

    expect(result.healthy).toBe(true);
    expect(result.epoch).toBe("100");
    expect(result.blockHeight).toBe("5000000");
    expect(result.ledgerVersion).toBe("10000000");
    expect(result.chainId).toBe("1");
    expect(result.validatorCount).toBe(104);
  });

  it("throws when fullnode is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({ ok: false, status: 503 });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }),
    );

    await expect(fetchNetworkStatus("mainnet")).rejects.toThrow(
      "Fullnode returned 503",
    );
  });

  it("returns null validatorCount when optional resources fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLedger),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }),
    );

    const result = await fetchNetworkStatus("devnet");
    expect(result.healthy).toBe(true);
    expect(result.validatorCount).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/git/explorer && pnpm test --run useGetNetworkStatus
```

Expected: FAIL — `fetchNetworkStatus` is not defined.

- [ ] **Step 3: Implement `useGetNetworkStatus.ts`**

`app/api/hooks/useGetNetworkStatus.ts`:
```typescript
import { useQuery } from "@tanstack/react-query";
import { getApiKey, type NetworkName, networks } from "../../lib/constants";

export type NetworkStatus = {
  healthy: boolean;
  epoch: string;
  blockHeight: string;
  ledgerVersion: string;
  chainId: string;
  validatorCount: number | null;
};

export async function fetchNetworkStatus(
  networkName: NetworkName,
): Promise<NetworkStatus> {
  const baseUrl = networks[networkName];
  const apiKey = getApiKey(networkName);
  const headers: Record<string, string> = apiKey
    ? { Authorization: `Bearer ${apiKey}` }
    : {};

  const res = await fetch(`${baseUrl}/`, { headers });
  if (!res.ok) throw new Error(`Fullnode returned ${res.status}`);
  const ledger = await res.json();

  let validatorCount: number | null = null;
  try {
    const sRes = await fetch(
      `${baseUrl}/accounts/0x1/resource/0x1::stake::ValidatorSet`,
      { headers },
    );
    if (sRes.ok) {
      const s = await sRes.json();
      validatorCount = (
        s.data as { active_validators: unknown[] }
      ).active_validators.length;
    }
  } catch {
    // optional field
  }

  return {
    healthy: true,
    epoch: String(ledger.epoch),
    blockHeight: String(ledger.block_height),
    ledgerVersion: String(ledger.ledger_version),
    chainId: String(ledger.chain_id),
    validatorCount,
  };
}

export function useGetNetworkStatus(networkName: NetworkName) {
  return useQuery({
    queryKey: ["deployments", "networkStatus", networkName],
    queryFn: () => fetchNetworkStatus(networkName),
    staleTime: 60_000,
    retry: 1,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/git/explorer && pnpm test --run useGetNetworkStatus
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/git/explorer
git add app/api/hooks/useGetNetworkStatus.ts app/api/hooks/useGetNetworkStatus.test.ts
git commit -m "feat: add useGetNetworkStatus hook with tests"
```

---

## Task 3: Deployments page

**Files:**
- Create: `app/pages/Deployments/NetworkCard.tsx`
- Modify: `app/pages/Deployments/Index.tsx` (replace stub)

- [ ] **Step 1: Implement `NetworkCard.tsx`**

`app/pages/Deployments/NetworkCard.tsx`:
```typescript
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useGetNetworkStatus } from "../../api/hooks/useGetNetworkStatus";
import type { NetworkName } from "../../lib/constants";

const NETWORK_LABEL: Record<string, string> = {
  mainnet: "Mainnet",
  testnet: "Testnet",
  devnet: "Devnet",
};

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontFamily="monospace">
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

export function NetworkCard({ network }: { network: NetworkName }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetNetworkStatus(network);

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["deployments", "networkStatus", network],
    });
  };

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {NETWORK_LABEL[network] ?? network}
          </Typography>
          {isLoading && <CircularProgress size={16} />}
          {!isLoading && (
            <Chip
              label={isError ? "Down" : "Up"}
              color={isError ? "error" : "success"}
              size="small"
            />
          )}
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isError && (
          <Typography variant="body2" color="error">
            Unable to reach fullnode
          </Typography>
        )}

        {data && (
          <>
            <StatusRow label="Epoch" value={data.epoch} />
            <StatusRow label="Block Height" value={data.blockHeight} />
            <StatusRow label="Ledger Version" value={data.ledgerVersion} />
            <StatusRow label="Chain ID" value={data.chainId} />
            <StatusRow label="Validators" value={data.validatorCount} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Replace stub `Deployments/Index.tsx` with the real page**

`app/pages/Deployments/Index.tsx`:
```typescript
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { PageMetadata } from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";
import { NetworkCard } from "./NetworkCard";

const NETWORKS = ["mainnet", "testnet", "devnet"] as const;

export default function DeploymentsPage() {
  const queryClient = useQueryClient();

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["deployments"] });
  };

  return (
    <Box>
      <PageMetadata
        title="Network Deployments"
        description="Live on-chain status for Aptos mainnet, testnet, and devnet — epoch, block height, framework version, and validator count."
        type="website"
        keywords={["deployments", "network", "status", "mainnet", "testnet", "devnet"]}
        canonicalPath="/deployments"
      />
      <PageHeader />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h3" component="h1">
          Network Deployments
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={handleRefreshAll}
        >
          Refresh All
        </Button>
      </Box>
      <Grid container spacing={3}>
        {NETWORKS.map((network) => (
          <Grid key={network} size={{ xs: 12, md: 4 }}>
            <NetworkCard network={network} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
```

- [ ] **Step 3: Verify `/deployments` in dev server**

```bash
cd ~/git/explorer && pnpm dev
```

Navigate to `http://localhost:3000/deployments`. You should see three cards (Mainnet, Testnet, Devnet) each with a health chip and data rows. Verify the "Refresh All" button and per-card refresh icons work (data re-fetches). Verify one failing network (e.g. devnet if unreachable) shows the "Down" chip without breaking the other cards.

- [ ] **Step 4: Commit**

```bash
cd ~/git/explorer
git add app/pages/Deployments/NetworkCard.tsx app/pages/Deployments/Index.tsx
git commit -m "feat: implement deployments page with per-network status cards"
```

---

## Task 4: AIP data hook

**Files:**
- Create: `app/api/hooks/useGetAIPs.ts`
- Create: `app/api/hooks/useGetAIPs.test.ts`

- [ ] **Step 1: Write the failing test**

`app/api/hooks/useGetAIPs.test.ts`:
```typescript
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAIPs } from "./useGetAIPs";

const MOCK_TREE = {
  tree: [
    { path: "aips/aip-1.md", sha: "abc" },
    { path: "aips/aip-42.md", sha: "def" },
    { path: "README.md", sha: "ghi" },           // should be filtered out
    { path: "aips/template.md", sha: "jkl" },   // should be filtered out
  ],
};

const AIP_1_CONTENT = `---
aip: 1
title: Proposer Selection
author: Alice
Status: Final
---
Content here.
`;

const AIP_42_CONTENT = `---
aip: 42
title: On-chain Randomness
author: Bob <bob@example.com>
Status: Draft
---
Content here.
`;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchAIPs", () => {
  it("returns parsed AIPs sorted by number, filtering non-AIP files", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("git/trees")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(MOCK_TREE),
          });
        }
        if (url.includes("aip-1.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_1_CONTENT),
          });
        }
        if (url.includes("aip-42.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_42_CONTENT),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }),
    );

    const result = await fetchAIPs();

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(1);
    expect(result[0].title).toBe("Proposer Selection");
    expect(result[0].status).toBe("Final");
    expect(result[0].author).toBe("Alice");
    expect(result[0].githubUrl).toContain("aip-1.md");
    expect(result[1].number).toBe(42);
  });

  it("throws RATE_LIMITED when GitHub returns 403", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );

    await expect(fetchAIPs()).rejects.toThrow("RATE_LIMITED");
  });

  it("skips files whose raw content fails without aborting the whole fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("git/trees")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                tree: [
                  { path: "aips/aip-1.md", sha: "abc" },
                  { path: "aips/aip-2.md", sha: "xyz" },
                ],
              }),
          });
        }
        if (url.includes("aip-1.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_1_CONTENT),
          });
        }
        // aip-2 fails
        return Promise.resolve({ ok: false, status: 500 });
      }),
    );

    const result = await fetchAIPs();
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/git/explorer && pnpm test --run useGetAIPs
```

Expected: FAIL — `fetchAIPs` is not defined.

- [ ] **Step 3: Implement `useGetAIPs.ts`**

`app/api/hooks/useGetAIPs.ts`:
```typescript
import { useQuery } from "@tanstack/react-query";

export type AIP = {
  number: number;
  title: string;
  status: string;
  author: string;
  githubUrl: string;
};

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
    if (key && value) result[key] = value;
  }
  return result;
}

export async function fetchAIPs(): Promise<AIP[]> {
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

  const treeRes = await fetch(
    "https://api.github.com/repos/aptos-foundation/AIPs/git/trees/main?recursive=1",
    { headers },
  );
  if (!treeRes.ok) {
    if (treeRes.status === 403) throw new Error("RATE_LIMITED");
    throw new Error(`GitHub API error: ${treeRes.status}`);
  }
  const tree = (await treeRes.json()) as { tree: { path: string }[] };

  const aipFiles = tree.tree.filter((f) => /^aips\/aip-\d+\.md$/.test(f.path));

  const results = await Promise.all(
    aipFiles.map(async (file): Promise<AIP | null> => {
      try {
        const m = file.path.match(/aip-(\d+)\.md$/);
        if (!m) return null;
        const number = parseInt(m[1], 10);

        const rawRes = await fetch(
          `https://raw.githubusercontent.com/aptos-foundation/AIPs/main/${file.path}`,
        );
        if (!rawRes.ok) return null;
        const content = await rawRes.text();
        const fm = parseFrontmatter(content);

        return {
          number,
          title: fm.title ?? `AIP-${number}`,
          status: fm.status ?? "Unknown",
          author: fm.author ?? "",
          githubUrl: `https://github.com/aptos-foundation/AIPs/blob/main/${file.path}`,
        };
      } catch {
        return null;
      }
    }),
  );

  return results
    .filter((a): a is AIP => a !== null)
    .sort((a, b) => a.number - b.number);
}

export function useGetAIPs() {
  return useQuery({
    queryKey: ["aips"],
    queryFn: fetchAIPs,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/git/explorer && pnpm test --run useGetAIPs
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/git/explorer
git add app/api/hooks/useGetAIPs.ts app/api/hooks/useGetAIPs.test.ts
git commit -m "feat: add useGetAIPs hook with GitHub tree + raw content fetching"
```

---

## Task 5: AIPs page

**Files:**
- Modify: `app/pages/AIPs/Index.tsx` (replace stub)

- [ ] **Step 1: Replace stub `AIPs/Index.tsx` with the real page**

`app/pages/AIPs/Index.tsx`:
```typescript
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useGetAIPs, type AIP } from "../../api/hooks/useGetAIPs";
import { PageMetadata } from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";

type StatusColor =
  | "default"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error";

const STATUS_COLORS: Record<string, StatusColor> = {
  draft: "info",
  "last call": "warning",
  accepted: "success",
  final: "success",
  withdrawn: "error",
  living: "default",
};

const STATUS_FILTERS = [
  "All",
  "Draft",
  "Last Call",
  "Accepted",
  "Final",
  "Withdrawn",
  "Living",
];

type SortField = keyof Pick<AIP, "number" | "title" | "status" | "author">;

export default function AIpsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useGetAIPs();
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const isRateLimited =
    isError && error instanceof Error && error.message === "RATE_LIMITED";

  const filtered = (data ?? [])
    .filter(
      (aip) =>
        statusFilter === "All" ||
        aip.status.toLowerCase() === statusFilter.toLowerCase(),
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "number") return dir * (a.number - b.number);
      return dir * String(a[sortField]).localeCompare(String(b[sortField]));
    });

  return (
    <Box>
      <PageMetadata
        title="Aptos Improvement Proposals"
        description="Track all Aptos Improvement Proposals (AIPs) — status, authors, and links to source."
        type="website"
        keywords={["AIP", "improvement proposals", "governance", "Aptos"]}
        canonicalPath="/aips"
      />
      <PageHeader />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h3" component="h1">
          Improvement Proposals
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["aips"] })}
        >
          Refresh
        </Button>
      </Box>

      {isRateLimited && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          GitHub API rate limited — try again in a few minutes
        </Alert>
      )}
      {isError && !isRateLimited && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load AIPs
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            label={s}
            onClick={() => setStatusFilter(s)}
            color={statusFilter === s ? "primary" : "default"}
            variant={statusFilter === s ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {isLoading && <CircularProgress />}

      {!isLoading && !isError && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {(
                  [
                    { field: "number", label: "AIP #" },
                    { field: "title", label: "Title" },
                    { field: "status", label: "Status" },
                    { field: "author", label: "Author" },
                  ] as { field: SortField; label: string }[]
                ).map(({ field, label }) => (
                  <TableCell key={field}>
                    <TableSortLabel
                      active={sortField === field}
                      direction={sortField === field ? sortDir : "asc"}
                      onClick={() => handleSort(field)}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((aip) => (
                <TableRow key={aip.number} hover>
                  <TableCell>{aip.number}</TableCell>
                  <TableCell>{aip.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={aip.status}
                      size="small"
                      color={STATUS_COLORS[aip.status.toLowerCase()] ?? "default"}
                    />
                  </TableCell>
                  <TableCell>{aip.author}</TableCell>
                  <TableCell>
                    <Link href={aip.githubUrl} target="_blank" rel="noopener">
                      View →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
```

- [ ] **Step 2: Verify `/aips` in dev server**

```bash
cd ~/git/explorer && pnpm dev
```

Navigate to `http://localhost:3000/aips`. Verify:
- Table loads and shows AIP rows
- Status filter chips narrow the list correctly
- Clicking column headers sorts the table
- "Refresh" button re-fetches
- Each row has a working "View →" link to GitHub

- [ ] **Step 3: Commit**

```bash
cd ~/git/explorer
git add app/pages/AIPs/Index.tsx
git commit -m "feat: implement AIPs page with sortable table and status filter"
```

---

## Task 6: Releases data hook

**Files:**
- Create: `app/api/hooks/useGetReleases.ts`
- Create: `app/api/hooks/useGetReleases.test.ts`

- [ ] **Step 1: Write the failing test**

`app/api/hooks/useGetReleases.test.ts`:
```typescript
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchReleases } from "./useGetReleases";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchReleases", () => {
  it("returns version data from all registries in parallel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("registry.npmjs.org")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ version: "2.1.0" }),
          });
        }
        if (url.includes("pypi.org")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ info: { version: "1.5.0" } }),
          });
        }
        if (url.includes("crates.io")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                crate: { newest_version: "3.0.0", updated_at: "2026-01-01T00:00:00Z" },
              }),
          });
        }
        if (url.includes("proxy.golang.org")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ Version: "v0.6.2", Time: "2026-01-01T00:00:00Z" }),
          });
        }
        if (url.includes("api.github.com")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  tag_name: "aptos-cli-v4.5.0",
                  html_url: "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.5.0",
                  published_at: "2026-01-01T00:00:00Z",
                },
                {
                  tag_name: "aptos-node-v1.20.0",
                  html_url: "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-node-v1.20.0",
                  published_at: "2026-01-01T00:00:00Z",
                },
              ]),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }),
    );

    const result = await fetchReleases();

    expect(result.typescript.status).toBe("success");
    if (result.typescript.status === "success") {
      expect(result.typescript.version).toBe("2.1.0");
    }
    expect(result.python.status).toBe("success");
    if (result.python.status === "success") {
      expect(result.python.version).toBe("1.5.0");
    }
    expect(result.rust.status).toBe("success");
    if (result.rust.status === "success") {
      expect(result.rust.version).toBe("3.0.0");
    }
    expect(result.go.status).toBe("success");
    if (result.go.status === "success") {
      expect(result.go.version).toBe("v0.6.2");
    }
    expect(result.cli.status).toBe("success");
    if (result.cli.status === "success") {
      expect(result.cli.version).toBe("v4.5.0");
    }
    expect(result.node.status).toBe("success");
    if (result.node.status === "success") {
      expect(result.node.version).toBe("v1.20.0");
    }
  });

  it("returns error status for a registry that fails without aborting others", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("registry.npmjs.org")) {
          return Promise.reject(new Error("Network error"));
        }
        if (url.includes("pypi.org")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ info: { version: "1.5.0" } }),
          });
        }
        if (url.includes("crates.io")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                crate: { newest_version: "3.0.0", updated_at: "2026-01-01T00:00:00Z" },
              }),
          });
        }
        if (url.includes("proxy.golang.org")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ Version: "v0.6.2", Time: "2026-01-01T00:00:00Z" }),
          });
        }
        if (url.includes("api.github.com")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }),
    );

    const result = await fetchReleases();
    expect(result.typescript.status).toBe("error");
    expect(result.python.status).toBe("success");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/git/explorer && pnpm test --run useGetReleases
```

Expected: FAIL — `fetchReleases` is not defined.

- [ ] **Step 3: Implement `useGetReleases.ts`**

`app/api/hooks/useGetReleases.ts`:
```typescript
import { useQuery } from "@tanstack/react-query";

export type ReleaseSuccess = {
  status: "success";
  version: string;
  publishedAt: string | null;
  link: string;
};

export type ReleaseError = {
  status: "error";
  message: string;
};

export type ReleaseResult = ReleaseSuccess | ReleaseError;

export type ReleasesData = {
  cli: ReleaseResult;
  node: ReleaseResult;
  typescript: ReleaseResult;
  python: ReleaseResult;
  rust: ReleaseResult;
  go: ReleaseResult;
};

async function fetchNpm(): Promise<ReleaseResult> {
  try {
    const res = await fetch(
      "https://registry.npmjs.org/@aptos-labs/ts-sdk/latest",
    );
    if (!res.ok) throw new Error(`npm returned ${res.status}`);
    const data = (await res.json()) as { version: string };
    return {
      status: "success",
      version: data.version,
      publishedAt: null,
      link: `https://www.npmjs.com/package/@aptos-labs/ts-sdk/v/${data.version}`,
    };
  } catch (e) {
    return { status: "error", message: String(e) };
  }
}

async function fetchPyPI(): Promise<ReleaseResult> {
  try {
    const res = await fetch("https://pypi.org/pypi/aptos-sdk/json");
    if (!res.ok) throw new Error(`PyPI returned ${res.status}`);
    const data = (await res.json()) as { info: { version: string } };
    const { version } = data.info;
    return {
      status: "success",
      version,
      publishedAt: null,
      link: `https://pypi.org/project/aptos-sdk/${version}/`,
    };
  } catch (e) {
    return { status: "error", message: String(e) };
  }
}

async function fetchCratesIo(): Promise<ReleaseResult> {
  try {
    const res = await fetch("https://crates.io/api/v1/crates/aptos-sdk", {
      headers: {
        "User-Agent": "aptos-explorer (https://explorer.aptoslabs.com)",
      },
    });
    if (!res.ok) throw new Error(`crates.io returned ${res.status}`);
    const data = (await res.json()) as {
      crate: { newest_version: string; updated_at: string };
    };
    const version = data.crate.newest_version;
    return {
      status: "success",
      version,
      publishedAt: data.crate.updated_at,
      link: `https://crates.io/crates/aptos-sdk/${version}`,
    };
  } catch (e) {
    return { status: "error", message: String(e) };
  }
}

async function fetchGoProxy(): Promise<ReleaseResult> {
  try {
    const res = await fetch(
      "https://proxy.golang.org/github.com/aptos-labs/aptos-go-sdk/@latest",
    );
    if (!res.ok) throw new Error(`Go proxy returned ${res.status}`);
    const data = (await res.json()) as { Version: string; Time: string };
    return {
      status: "success",
      version: data.Version,
      publishedAt: data.Time,
      link: `https://pkg.go.dev/github.com/aptos-labs/aptos-go-sdk@${data.Version}`,
    };
  } catch (e) {
    return { status: "error", message: String(e) };
  }
}

async function fetchGitHubCoreReleases(): Promise<{
  cli: ReleaseResult;
  node: ReleaseResult;
}> {
  try {
    const githubToken = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

    const res = await fetch(
      "https://api.github.com/repos/aptos-labs/aptos-core/releases?per_page=50",
      { headers },
    );
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const releases = (await res.json()) as {
      tag_name: string;
      html_url: string;
      published_at: string;
    }[];

    const cliRelease = releases.find((r) =>
      r.tag_name.startsWith("aptos-cli-v"),
    );
    const nodeRelease = releases.find((r) =>
      r.tag_name.startsWith("aptos-node-v"),
    );

    return {
      cli: cliRelease
        ? {
            status: "success",
            version: cliRelease.tag_name.replace("aptos-cli-", ""),
            publishedAt: cliRelease.published_at,
            link: cliRelease.html_url,
          }
        : { status: "error", message: "No CLI release found in last 50" },
      node: nodeRelease
        ? {
            status: "success",
            version: nodeRelease.tag_name.replace("aptos-node-", ""),
            publishedAt: nodeRelease.published_at,
            link: nodeRelease.html_url,
          }
        : { status: "error", message: "No node release found in last 50" },
    };
  } catch (e) {
    const msg = String(e);
    return {
      cli: { status: "error", message: msg },
      node: { status: "error", message: msg },
    };
  }
}

export async function fetchReleases(): Promise<ReleasesData> {
  const [githubCore, typescript, python, rust, go] = await Promise.all([
    fetchGitHubCoreReleases(),
    fetchNpm(),
    fetchPyPI(),
    fetchCratesIo(),
    fetchGoProxy(),
  ]);

  return {
    cli: githubCore.cli,
    node: githubCore.node,
    typescript,
    python,
    rust,
    go,
  };
}

export function useGetReleases() {
  return useQuery({
    queryKey: ["releases"],
    queryFn: fetchReleases,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/git/explorer && pnpm test --run useGetReleases
```

Expected: all 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/git/explorer
git add app/api/hooks/useGetReleases.ts app/api/hooks/useGetReleases.test.ts
git commit -m "feat: add useGetReleases hook fetching npm/PyPI/crates.io/Go/GitHub"
```

---

## Task 7: Releases page

**Files:**
- Create: `app/pages/Releases/ReleaseCard.tsx`
- Modify: `app/pages/Releases/Index.tsx` (replace stub)

- [ ] **Step 1: Implement `ReleaseCard.tsx`**

`app/pages/Releases/ReleaseCard.tsx`:
```typescript
import { Box, Card, CardContent, Link, Typography } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import type { ReleaseResult } from "../../api/hooks/useGetReleases";

type ReleaseCardProps = {
  name: string;
  registry: string;
  result: ReleaseResult;
};

export function ReleaseCard({ name, registry, result }: ReleaseCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mb={1}
        >
          {registry}
        </Typography>

        {result.status === "error" ? (
          <Typography variant="body2" color="error">
            {result.message}
          </Typography>
        ) : (
          <Box>
            <Typography variant="h5" fontFamily="monospace" gutterBottom>
              {result.version}
            </Typography>
            {result.publishedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
              >
                {formatDistanceToNow(new Date(result.publishedAt), {
                  addSuffix: true,
                })}
              </Typography>
            )}
            <Link href={result.link} target="_blank" rel="noopener">
              View release →
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Replace stub `Releases/Index.tsx` with the real page**

`app/pages/Releases/Index.tsx`:
```typescript
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useGetReleases } from "../../api/hooks/useGetReleases";
import { PageMetadata } from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";
import { ReleaseCard } from "./ReleaseCard";

const RELEASE_META = [
  { key: "cli" as const, name: "Aptos CLI", registry: "GitHub Releases" },
  { key: "node" as const, name: "aptos-node", registry: "GitHub Releases" },
  { key: "typescript" as const, name: "TypeScript SDK", registry: "npm" },
  { key: "python" as const, name: "Python SDK", registry: "PyPI" },
  { key: "rust" as const, name: "Rust SDK", registry: "crates.io" },
  { key: "go" as const, name: "Go SDK", registry: "pkg.go.dev" },
];

export default function ReleasesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetReleases();

  return (
    <Box>
      <PageMetadata
        title="SDK & Tool Releases"
        description="Latest release versions for the Aptos CLI, node software, and all official SDKs — TypeScript, Python, Rust, and Go."
        type="website"
        keywords={["releases", "SDK", "CLI", "versions", "npm", "PyPI", "crates"]}
        canonicalPath="/releases"
      />
      <PageHeader />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h3" component="h1">
          SDK & Tool Releases
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["releases"] })
          }
        >
          Refresh
        </Button>
      </Box>

      {isLoading && <CircularProgress />}

      {data && (
        <Grid container spacing={3}>
          {RELEASE_META.map(({ key, name, registry }) => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <ReleaseCard name={name} registry={registry} result={data[key]} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
```

- [ ] **Step 3: Verify `/releases` in dev server**

```bash
cd ~/git/explorer && pnpm dev
```

Navigate to `http://localhost:3000/releases`. Verify:
- Six cards render (CLI, node, TS SDK, Python SDK, Rust SDK, Go SDK)
- Each successful card shows a version number, relative publish date, and a working link
- Any card with a fetch failure shows an error message rather than crashing the page
- "Refresh" button re-fetches all cards

- [ ] **Step 4: Run all tests**

```bash
cd ~/git/explorer && pnpm test --run
```

Expected: all tests pass including the three new test files.

- [ ] **Step 5: Commit**

```bash
cd ~/git/explorer
git add app/pages/Releases/ReleaseCard.tsx app/pages/Releases/Index.tsx
git commit -m "feat: implement releases page with per-registry SDK version cards"
```

---

## Environment Variable (Optional)

To raise GitHub API rate limits beyond 60 req/hr, add `VITE_GITHUB_TOKEN` to `~/git/explorer/.env.local`:

```
VITE_GITHUB_TOKEN=ghp_your_token_here
```

This is optional — the pages work without it. The token only affects the AIP tree fetch and the GitHub releases fetch for CLI/node.
