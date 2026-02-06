# Coding Bad Practices Report

**Generated:** February 6, 2026  
**Project:** Upsell Funnel Builder

This report documents coding bad practices, potential issues, and areas for improvement found during a comprehensive codebase scan.

---

## 🔴 Critical Issues

### 3. localStorage Access Without SSR Guards

**Location:** `app/stores/funnel.ts` (multiple locations)

**Issue:** Direct `localStorage` access without checking if code is running on client-side.

**Problem:**

- While there's a check at line 445 (`if (import.meta.client)`), individual `localStorage` calls throughout the store don't have guards
- Could cause SSR errors if code path changes

**Current Pattern:**

```typescript
const data = localStorage.getItem(
  `${STORAGE_KEY_PREFIX}${id}`
)
```

**Recommendation:**

- Create a safe localStorage wrapper utility
- Add guards to all localStorage operations
- Consider using `useStorage` from VueUse which handles SSR automatically

---

## 🟡 Medium Priority Issues

### 4. Excessive Type Assertions

**Locations:** Multiple files

**Issue:** Overuse of `as` type assertions, indicating potential type safety gaps.

**Examples:**

- `app/components/NodePalette.vue:4` - `as [Funnel.NodeType, Funnel.NodeTypeConfig][]`
- `app/components/BuilderPanel/index.vue:104` - `as Funnel.NodeType`
- `app/stores/funnel.ts:56,420` - `as Funnel.NodeType`
- `app/utils/funnelValidation.ts:147,231` - `as Funnel.NodeType`

**Problem:**

- Type assertions bypass TypeScript's type checking
- Can hide runtime errors
- Indicates incomplete type definitions

**Recommendation:**

- Improve type definitions to avoid assertions
- Use type guards instead of assertions where possible
- Review Vue Flow type definitions and create proper type mappings

---

### 5. Magic Numbers Throughout Codebase

**Locations:** Multiple files

**Issue:** Hardcoded numeric values without named constants.

**Examples:**

- `app/components/BuilderPanel/index.vue:126,128` - `wait(100)`, `wait(350)`
- `app/components/BuilderPanel/index.vue:52-53` - `x + 100`, `y + 37.5`
- `app/components/BuilderPanel/index.vue:194-195` - `width: 25`, `height: 25`
- `app/components/BuilderPanel/ValidationPane.vue:52-56` - Hardcoded zoom and position values
- `app/utils/time.ts` - Wait function without context

**Problem:**

- Hard to maintain and understand
- Difficult to adjust values consistently
- No single source of truth

**Recommendation:**

- Create constants file for animation durations, delays, and UI dimensions
- Extract magic numbers to named constants with descriptive names
- Document the purpose of each constant

**Suggested Structure:**

```typescript
// app/utils/constants.ts
export const ANIMATION_DURATIONS = {
  FIT_VIEW: 300,
  LOADING_DELAY: 100,
  LOADING_COMPLETE: 350,
  ZOOM_TRANSITION: 100
} as const

export const UI_DIMENSIONS = {
  MARKER_WIDTH: 25,
  MARKER_HEIGHT: 25,
  NODE_CENTER_OFFSET_X: 100,
  NODE_CENTER_OFFSET_Y: 37.5
} as const
```

---

### 6. Inconsistent Error Handling

**Location:** `app/stores/funnel.ts`

**Issue:** Inconsistent error handling patterns across the store.

**Examples:**

- `getSavedFunnelData()` - Silent catch, returns null
- `loadSavedFunnelsIndex()` - Silent catch, sets empty array
- `saveFunnelsIndex()` - Shows toast on error
- `saveFunnel()` - Shows toast on error
- `importFunnel()` - Shows toast on error

**Problem:**

- Some errors are silently swallowed
- Inconsistent user feedback
- Difficult to debug issues

**Recommendation:**

- Standardize error handling approach
- Create error handling utility/composable
- Log errors to console in development
- Consider error boundary pattern for critical operations

---

### 7. Missing Null Checks

**Location:** `app/components/BuilderPanel/index.vue:143`

**Issue:** Type assertion without null check.

```typescript
const target = event.target as HTMLElement
```

**Problem:**

- `event.target` can be null
- Type assertion doesn't guarantee runtime safety

**Recommendation:**

```typescript
const target = event.target
if (!(target instanceof HTMLElement)) return
```

---

### 8. Code Duplication in Edge/Node Mapping

**Location:** `app/stores/funnel.ts:187-204` and `308-325`

**Issue:** Similar code for mapping nodes and edges appears in both `loadFunnel` and `importFunnel`.

**Problem:**

- Duplication increases maintenance burden
- Changes need to be made in multiple places
- Risk of inconsistencies

**Recommendation:**

- Extract mapping logic to helper functions
- Create `mapSerializedNodesToVueFlowNodes()` and `mapSerializedEdgesToVueFlowEdges()` utilities

---

### 9. Hardcoded Personal Links

**Location:** `app/components/NodePalette.vue:41-60`

**Issue:** Personal portfolio links hardcoded in component.

**Problem:**

- Not configurable
- Mixes business logic with presentation
- Hard to reuse component

**Recommendation:**

- Move to app config or environment variables
- Make it configurable via props or composable
- Consider removing if not needed for production

---

### 10. Wait Utility Without Cleanup

**Location:** `app/utils/time.ts`

**Issue:** Promise-based wait function doesn't support cancellation.

```typescript
export const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

**Problem:**

- No way to cancel pending waits
- Can cause memory leaks if component unmounts
- Race conditions possible

**Recommendation:**

- Use `useTimeoutFn` from VueUse instead
- Or add AbortController support for cancellation
- Consider using Vue's `nextTick` for DOM-related waits

---

## 🟢 Low Priority / Code Quality Issues

### 11. Inconsistent Naming Conventions

**Location:** Various files

**Issue:** Some inconsistencies in naming patterns.

**Examples:**

- `useNodeSizes()` returns object but follows composable naming (should be `useNodeSize()` or return directly)
- Mix of `camelCase` and `PascalCase` in some contexts

**Recommendation:**

- Review and standardize naming conventions
- Follow Vue 3 composition API naming patterns consistently

---

### 12. Missing JSDoc/Type Documentation

**Location:** Utility functions

**Issue:** Complex utility functions lack documentation.

**Examples:**

- `app/utils/funnelValidation.ts` - Validator functions
- `app/utils/connectionValidation.ts` - Validator functions
- `app/utils/nodeConfigs.ts` - Configuration objects

**Recommendation:**

- Add JSDoc comments for public APIs
- Document complex algorithms and business logic
- Explain non-obvious type relationships

---

### 13. Potential Performance Issues

#### 13.1 Deep Watchers Without Optimization

**Location:** `app/stores/funnel.ts:440-442`

```typescript
watch([nodes, edges, funnelName], () => debouncedSave(), {
  deep: true
})
```

**Issue:** Deep watching large arrays can be expensive.

**Recommendation:**

- Consider using `watchEffect` with more specific dependencies
- Use `watchDebounced` from VueUse
- Consider serializing only changed data

#### 13.2 Array Operations in Loops

**Location:** `app/utils/funnelValidation.ts:116-133`

**Issue:** Using `Array.some()` inside loops can be inefficient for large datasets.

**Recommendation:**

- Create lookup maps/sets for O(1) access
- Optimize validation algorithms for better performance

---

### 14. Type Safety Improvements

#### 14.1 Optional Chaining Overuse

**Location:** Various files

**Issue:** Excessive optional chaining may indicate incomplete type definitions.

**Examples:**

- `data?.nodeType`, `data?.title`, `config?.handles`

**Recommendation:**

- Review type definitions to ensure completeness
- Use type guards where appropriate
- Consider non-null assertions (`!`) when values are guaranteed to exist

#### 14.2 Missing Generic Constraints

**Location:** `app/utils/connectionValidation.ts`

**Issue:** Validator functions could benefit from better generic typing.

**Recommendation:**

- Add generic constraints to improve type inference
- Create more specific types for validation contexts

---

### 15. Accessibility Concerns

#### 15.1 Missing ARIA Labels

**Location:** Some interactive elements

**Issue:** Not all interactive elements have proper ARIA labels.

**Recommendation:**

- Audit all interactive elements
- Ensure keyboard navigation is fully supported
- Test with screen readers

#### 15.2 Focus Management

**Location:** `app/components/BuilderLayout/MobileDrawers.vue:13-17`

**Issue:** Manual focus blurring may interfere with accessibility.

```typescript
const blurActiveElement = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
```

**Recommendation:**

- Review focus management strategy
- Ensure focus is properly managed for keyboard users
- Consider using Vue's `useFocus` composable

---

### 16. Configuration Issues

#### 16.1 Prettier Config Inconsistency

**Location:** `.prettierrc.yaml`

**Issue:** `trailingComma: none` conflicts with modern JavaScript best practices.

**Recommendation:**

- Consider using `trailingComma: 'es5'` or `'all'`
- Improves git diffs and reduces merge conflicts

#### 16.2 Missing ESLint Configuration

**Location:** Project root

**Issue:** No ESLint configuration found, relying only on TypeScript compiler.

**Recommendation:**

- Add ESLint with Vue 3 and TypeScript plugins
- Enforce code quality rules
- Integrate with pre-commit hooks

---

## 📊 Summary Statistics

- **Critical Issues:** 3
- **Medium Priority Issues:** 7
- **Low Priority Issues:** 6
- **Total Issues Found:** 16

---

## 🎯 Recommended Action Plan

### Immediate (Critical)

1. ✅ Replace `document.querySelector` with Vue refs/composables
2. ✅ Enable and configure accessibility module
3. ✅ Add SSR guards to all localStorage operations

### Short-term (Medium Priority)

1. ✅ Reduce type assertions by improving type definitions
2. ✅ Extract magic numbers to constants file
3. ✅ Standardize error handling patterns
4. ✅ Extract duplicated mapping logic

### Long-term (Low Priority)

1. ✅ Add ESLint configuration
2. ✅ Improve documentation
3. ✅ Optimize performance-critical paths
4. ✅ Complete accessibility audit

---

## 📝 Notes

- Overall code quality is **good** - most issues are minor improvements
- TypeScript usage is generally good, but could be more strict
- Vue 3 Composition API patterns are followed well
- Testing infrastructure is in place (Vitest)
- No major security vulnerabilities detected
- Code follows project's style guidelines consistently

---

**Report Generated By:** Claude Code Analysis  
**Next Review Recommended:** After implementing critical and medium priority fixes
