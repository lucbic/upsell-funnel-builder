# Coding Bad Practices Report

**Generated:** February 6, 2026  
**Project:** Upsell Funnel Builder

This report documents coding bad practices, potential issues, and areas for improvement found during a comprehensive codebase scan.

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
