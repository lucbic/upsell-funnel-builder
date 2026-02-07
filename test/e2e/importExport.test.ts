import { readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from 'playwright-core'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeBrowser, createPage, launchBrowser } from './setup'
import {
  addNodeByKeyboard,
  connectNodes,
  dismissCheckerOverlay,
  getEdgeCount,
  getNodeCount,
  getNodeIds,
  waitForAutoSave
} from './helpers'

describe('Export / Import JSON', () => {
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

  it('exports funnel as JSON and imports it into a new funnel', async () => {
    // Build a small funnel
    const nameInput = page.locator('[aria-label="Funnel name"]')
    await nameInput.click({ force: true })
    await nameInput.clear()
    await nameInput.fill('Export Test')

    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')

    const nodeIds = await getNodeIds(page)
    await connectNodes(page, nodeIds[0]!, nodeIds[1]!)

    await expect(getNodeCount(page)).resolves.toBe(2)
    await expect(getEdgeCount(page)).resolves.toBe(1)

    await waitForAutoSave(page)

    // Dismiss overlay before clicking Export button
    await dismissCheckerOverlay(page)

    // Set up download listener and click Export
    const downloadPromise = page.waitForEvent('download')
    const exportBtn = page.locator('button', { hasText: 'Export' })
    await exportBtn.click()

    const download = await downloadPromise
    const downloadPath = join('/tmp', download.suggestedFilename())
    await download.saveAs(downloadPath)

    // Verify JSON structure
    const json = JSON.parse(readFileSync(downloadPath, 'utf-8'))
    expect(json.name).toBe('Export Test')
    expect(json.nodes).toHaveLength(2)
    expect(json.edges).toHaveLength(1)

    // Create a new funnel
    const newFunnelBtn = page.locator('button', { hasText: 'New Funnel' })
    await newFunnelBtn.click()

    // Verify canvas is empty
    await expect(getNodeCount(page)).resolves.toBe(0)
    await expect(getEdgeCount(page)).resolves.toBe(0)

    const resetName = page.locator('[aria-label="Funnel name"]')
    await expect(resetName.inputValue()).resolves.toBe('Untitled Funnel')

    // Import the exported file
    const fileInput = page.locator('[aria-label="Import funnel JSON file"]')
    await fileInput.setInputFiles(downloadPath)

    // Wait for import to process
    await page.waitForTimeout(500)

    // Verify restored state
    await expect(resetName.inputValue()).resolves.toBe('Export Test')
    await expect(getNodeCount(page)).resolves.toBe(2)
    await expect(getEdgeCount(page)).resolves.toBe(1)

    // Cleanup temp file
    try { unlinkSync(downloadPath) } catch {}
  })
})
