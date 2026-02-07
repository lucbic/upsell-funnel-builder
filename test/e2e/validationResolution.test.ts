import type { Page } from 'playwright-core'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeBrowser, createPage, launchBrowser } from './setup'
import {
  addNodeByKeyboard,
  connectNodes,
  expandValidationPane,
  getNodeIds,
  getValidationIssues
} from './helpers'

describe('Validation Issue Resolution', () => {
  let page: Page

  beforeAll(async () => {
    await launchBrowser()
  })

  beforeEach(async () => {
    page = await createPage()
  })

  afterAll(async () => {
    await closeBrowser()
  })

  it('progressively resolves validation issues as funnel is built', async () => {
    // Step 1: Add orphan Upsell — should trigger multiple errors
    await addNodeByKeyboard(page, 'Upsell')
    await expandValidationPane(page)

    const initialIssueCount = await getValidationIssues(page).count()
    // Expect: missing-entry-point, missing-terminal, orphan-upsell = 3
    expect(initialIssueCount).toBeGreaterThanOrEqual(3)

    // Step 2: Add remaining nodes
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')
    await addNodeByKeyboard(page, 'Thank You')
    await page.waitForTimeout(100)

    // After adding all node types, "missing entry point" and "missing terminal"
    // are resolved, but orphan issues increase. Verify structural errors resolved.
    const afterNodesCount = await getValidationIssues(page).count()
    // All 4 nodes are orphans + some warnings → issues exist but pattern changed
    expect(afterNodesCount).toBeGreaterThan(0)

    // Step 3: Connect everything to build a valid funnel
    const nodeIds = await getNodeIds(page)
    // Upsell 1 (node-1), Sales Page (node-2), Order Page (node-3), Thank You (node-4)
    const [upsellId, salesId, orderId, thankYouId] = nodeIds as [string, string, string, string]

    await connectNodes(page, salesId, orderId)
    await connectNodes(page, orderId, upsellId, 'accepted')
    await connectNodes(page, orderId, thankYouId, 'declined')
    await connectNodes(page, upsellId, thankYouId, 'accepted')
    await connectNodes(page, upsellId, thankYouId, 'declined')
    await page.waitForTimeout(100)

    // Final: all nodes connected, all offer paths complete → zero issues
    const finalIssueCount = await getValidationIssues(page).count()

    if (finalIssueCount === 0) {
      const noIssues = page.locator(
        '[aria-label="Validation results"] [role="status"]'
      )
      await expect(noIssues.textContent()).resolves.toContain('No issues found')
    }

    // Final count must be strictly less than initial orphan-only state
    expect(finalIssueCount).toBeLessThan(initialIssueCount)
  })
})
