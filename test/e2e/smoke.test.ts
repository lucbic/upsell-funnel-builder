import type { Page } from 'playwright-core'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeBrowser, createPage, launchBrowser } from './setup'

describe('Funnel Builder E2E Smoke Tests', () => {
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

  it('loads with core layout elements', async () => {
    const canvas = page.locator('[aria-label="Funnel builder canvas"]')
    await expect(canvas.isVisible()).resolves.toBe(true)

    const palette = page.locator('section[aria-label="Node palette"]')
    await expect(palette.isVisible()).resolves.toBe(true)

    const nameInput = page.locator('[aria-label="Funnel name"]')
    await expect(nameInput.inputValue()).resolves.toBe('Untitled Funnel')

    const paletteItems = page.locator('section[aria-label="Node palette"] [aria-label$="to canvas"]')
    await expect(paletteItems.count()).resolves.toBe(5)
  })

  it('adds a node to canvas via keyboard', async () => {
    const addButton = page.locator('[aria-label="Add Sales Page to canvas"]')
    await addButton.press('Enter')

    const nodes = page.locator('.vue-flow__node')
    await expect(nodes.count()).resolves.toBe(1)
  })

  it('edits the funnel name', async () => {
    const nameInput = page.locator('[aria-label="Funnel name"]')
    await nameInput.clear()
    await nameInput.fill('My Test Funnel')

    await expect(nameInput.inputValue()).resolves.toBe('My Test Funnel')
  })

  it('shows validation issues for orphan node', async () => {
    const addUpsell = page.locator('[aria-label="Add Upsell to canvas"]')
    await addUpsell.press('Enter')

    await page.waitForSelector('.vue-flow__node', { timeout: 5_000 })

    const toggleButton = page.locator('[aria-expanded]')
    const isExpanded = await toggleButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await toggleButton.click()
    }

    await page.waitForSelector('[aria-label="Validation results"]', { timeout: 5_000 })

    const results = page.locator('[aria-label="Validation results"]')
    await expect(results.isVisible()).resolves.toBe(true)

    const issues = results.locator('[role="button"]')
    const count = await issues.count()
    expect(count).toBeGreaterThan(0)
  })
})
