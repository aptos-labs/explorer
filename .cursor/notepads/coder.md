# Coder Notepad

Use this notepad to track implementation progress, code patterns, and discovered issues.

## Current Task

<!-- What are you working on? -->

## Code Patterns Reference

### Data Fetching Hook

```typescript
// See app/api/hooks/ for examples
export function useXData(id: string) {
  return useQuery({
    queryKey: ["x", id],
    queryFn: () => fetchX(id),
  });
}
```

### Component Structure

```typescript
// app/components/Example.tsx
export function Example({ prop }: ExampleProps) {
  return <div>...</div>;
}
```

## TODOs Found

- [ ] TODO item found during implementation

## Issues to File

<!-- Issues discovered that need `.agents/issues/` entries -->

## Notes

<!-- Implementation notes, gotchas, etc. -->
