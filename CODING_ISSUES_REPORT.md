# Coding Bad Practices Report

**Generated:** February 6, 2026  
**Project:** Upsell Funnel Builder

This report documents coding bad practices, potential issues, and areas for improvement found during a comprehensive codebase scan.

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
