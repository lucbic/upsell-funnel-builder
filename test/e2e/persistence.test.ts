import type { Page } from 'playwright-core'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeBrowser, createPage, launchBrowser } from './setup'
import {
  addNodeByKeyboard,
  connectNodes,
  getEdgeCount,
  getNodeCount,
  getNodeIds,
  getNodeTypes,
  waitForAutoSave,
  waitForCanvasReady
} from './helpers'

describe('Persistence Round-Trip', () => {
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

  it('persists funnel across page reload', async () => {
    // Set funnel name
    const nameInput = page.locator('[aria-label="Funnel name"]')
    await nameInput.click({ force: true })
    await nameInput.clear()
    await nameInput.fill('Persistence Test Funnel')

    // Add 3 nodes
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')
    await addNodeByKeyboard(page, 'Thank You')

    const nodeIds = await getNodeIds(page)
    const [salesId, orderId, thankYouId] = nodeIds as [string, string, string]

    // Connect them
    await connectNodes(page, salesId, orderId)
    await connectNodes(page, orderId, thankYouId, 'accepted')

    await expect(getNodeCount(page)).resolves.toBe(3)
    await expect(getEdgeCount(page)).resolves.toBe(2)

    // Wait for auto-save
    await waitForAutoSave(page)

    // Verify localStorage has funnel_index
    const indexLength = await page.evaluate(() => {
      const raw = localStorage.getItem('funnel_index')
      if (!raw) return 0
      return JSON.parse(raw).length
    })
    expect(indexLength).toBe(1)

    // Reload the page (same context, same localStorage)
    await page.reload()
    await waitForCanvasReady(page)

    // Verify state restored
    const restoredName = page.locator('[aria-label="Funnel name"]')
    await expect(restoredName.inputValue()).resolves.toBe('Persistence Test Funnel')

    await expect(getNodeCount(page)).resolves.toBe(3)
    await expect(getEdgeCount(page)).resolves.toBe(2)

    // Verify node types
    const types = await getNodeTypes(page)
    expect(types).toContain('sales-page')
    expect(types).toContain('order-page')
    expect(types).toContain('thank-you')
  })
})
