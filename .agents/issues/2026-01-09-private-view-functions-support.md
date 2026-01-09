# Private View Functions Support

**Issue**: Explorer does not render private view functions
**Date**: 2026-01-09
**Status**: Fixed

## Problem

Private view functions in Move modules are not displayed in the Aptos Explorer UI, even though they are publicly accessible outside the VM. The API's ABI endpoint (`/v1/accounts/{address}/modules`) does not include private view functions in the `exposed_functions` array, causing them to be hidden from the explorer interface.

## Example

The Econia project has a private view function `index_orders` that:

- Is declared with `#[view]` attribute
- Works correctly via CLI (`aptos move view`)
- Does not appear in the Explorer UI

Module address: `0x40b119411c6a975fca28f1ba5800a8a418bba1e16a3f13b1de92f731e023d135`
Function: `market::index_orders`

## Solution

Implemented a parser to extract private view functions directly from Move source code, which is available in the package metadata. The solution:

1. **Added parsing utilities** (`app/utils/utils.ts`):
   - `extractPrivateViewFunctions()`: Parses Move source code to find `#[view]` attributed private functions
   - `parseGenericTypeParams()`: Extracts generic type parameters with constraints
   - `parseParameters()`: Extracts function parameter types
   - `parseReturnType()`: Handles single and tuple return types

2. **Updated Contract component** (`app/pages/Account/Tabs/ModulesTab/Contract.tsx`):
   - Modified `moduleAndFnsGroup` memo to include both ABI exposed functions and parsed private view functions
   - Private view functions are only parsed for the "view" tab (not entry functions)
   - Merged private functions with public ones in a unified list

3. **Added comprehensive tests** (`app/utils/utils.test.ts`):
   - Tests for simple private view functions
   - Tests for functions with parameters, generics, and complex types
   - Tests for tuple return types
   - Edge cases (empty source, no private functions, etc.)

## Technical Details

The parser uses regex to match private view functions with this pattern:

```move
#[view]
fun function_name<T1, T2>(param1: Type1, param2: Type2): ReturnType {
  // implementation
}
```

Key features:

- Handles generic type parameters with constraints (e.g., `T: copy + drop`)
- Supports complex nested types (e.g., `vector<Order>`, `0x1::option::Option<address>`)
- Parses tuple return types (e.g., `(u64, address, bool)`)
- Correctly ignores public view functions (already in ABI)

## Testing

All 67 tests pass, including 9 new tests for private view function parsing:

- ✅ Simple function extraction
- ✅ Functions with parameters
- ✅ Generic type parameters with constraints
- ✅ Tuple return types
- ✅ Multiple functions in one module
- ✅ Complex parameter types
- ✅ Edge cases (empty source, no matches)

## Verification

To verify the fix works:

1. Navigate to the example account/module in the explorer
2. Go to the "View Functions" tab
3. Private view functions with `#[view]` attribute should now appear in the function list
4. These functions should be fully interactive with proper parameter inputs and execution

## Related Files

- `app/utils/utils.ts` - Parsing utilities
- `app/pages/Account/Tabs/ModulesTab/Contract.tsx` - UI integration
- `app/utils/utils.test.ts` - Test coverage

## References

- Original issue: https://github.com/aptos-labs/aptos-core/issues/8991
- Related PR: https://github.com/aptos-labs/aptos-core/pull/8539
- Example module: https://github.com/econia-labs/econia
