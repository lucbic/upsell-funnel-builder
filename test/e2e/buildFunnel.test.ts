import type { Page } from 'playwright-core'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeBrowser, createPage, launchBrowser } from './setup'
import {
  addNodeByKeyboard,
  connectNodes,
  expandValidationPane,
  getEdgeCount,
  getNodeCount,
  getNodeIds
} from './helpers'

describe('Build Complete Valid Funnel', () => {
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

  it('builds a full funnel with all paths connected and zero validation issues', async () => {
    // Add all 5 node types
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')
    await addNodeByKeyboard(page, 'Upsell')
    await addNodeByKeyboard(page, 'Downsell')
    await addNodeByKeyboard(page, 'Thank You')

    await expect(getNodeCount(page)).resolves.toBe(5)

    const nodeIds = await getNodeIds(page)
    const [salesId, orderId, upsellId, downsellId, thankYouId] = nodeIds as [string, string, string, string, string]

    // Sales Page → Order Page
    await connectNodes(page, salesId, orderId)

    // Order Page "accepted" → Upsell
    await connectNodes(page, orderId, upsellId, 'accepted')

    // Order Page "declined" → Downsell
    await connectNodes(page, orderId, downsellId, 'declined')

    // Upsell "accepted" → Thank You
    await connectNodes(page, upsellId, thankYouId, 'accepted')

    // Upsell "declined" → Downsell (complete the declined path)
    await connectNodes(page, upsellId, downsellId, 'declined')

    // Downsell "accepted" → Thank You
    await connectNodes(page, downsellId, thankYouId, 'accepted')

    // Downsell "declined" → Thank You (complete the declined path)
    await connectNodes(page, downsellId, thankYouId, 'declined')

    await expect(getEdgeCount(page)).resolves.toBe(7)

    // Expand validation and check for zero issues
    await expandValidationPane(page)

    const noIssues = page.locator('[aria-label="Validation results"] [role="status"]')
    await expect(noIssues.textContent()).resolves.toContain('No issues found')
  })
})
