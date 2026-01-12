# Tester Notepad

Use this notepad to track test coverage, test plans, and testing notes.

## Test Coverage Status

<!-- Current coverage metrics -->

## Test Plan

### Unit Tests Needed

- [ ] Utility function 1
- [ ] Utility function 2

### Component Tests Needed

- [ ] Component 1
- [ ] Component 2

### E2E Scenarios

- [ ] User flow 1
- [ ] User flow 2

## Test Patterns

### Mocking React Query

```typescript
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

### Testing Hooks

```typescript
const {result} = renderHook(() => useMyHook(), {wrapper});
```

## Flaky Tests

<!-- Track tests that intermittently fail -->

## Notes

<!-- Testing observations, infrastructure needs, etc. -->
