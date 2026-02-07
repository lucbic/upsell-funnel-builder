import type { Page } from 'playwright-core'

const CANVAS_READY = '[aria-label="Funnel builder canvas"]:not([aria-busy="true"])'

/**
 * Removes the vite-plugin-checker error overlay that intercepts pointer events.
 * Must be called after page load before any click interactions.
 */
export const dismissCheckerOverlay = (page: Page) =>
  page.evaluate(() => {
    document
      .querySelector('vite-plugin-checker-error-overlay')
      ?.remove()
  })

export const addNodeByKeyboard = async (
  page: Page,
  nodeType: string
) => {
  const button = page.locator(
    `[aria-label="Add ${nodeType} to canvas"]`
  )
  await button.press('Enter')
  await page.waitForTimeout(100)
}

export const getNodeCount = (page: Page) =>
  page.locator('.vue-flow__node').count()

export const getEdgeCount = (page: Page) =>
  page.locator('.vue-flow__edge').count()

export const clearLocalStorage = (page: Page) =>
  page.evaluate(() => localStorage.clear())

export const expandValidationPane = async (page: Page) => {
  await dismissCheckerOverlay(page)

  const toggle = page.locator('[aria-expanded]')
  const expanded = await toggle.getAttribute('aria-expanded')
  if (expanded === 'false') {
    await toggle.click()
  }
  await page.waitForSelector(
    '[aria-label="Validation results"]',
    { timeout: 5_000 }
  )
}

export const getValidationIssues = (page: Page) =>
  page
    .locator('[aria-label="Validation results"] [role="button"]')

export const connectNodes = async (
  page: Page,
  sourceId: string,
  targetId: string,
  sourceHandle?: string
) => {
  await page.evaluate(
    ({ sourceId, targetId, sourceHandle }) => {
      const store = (window as any).__nuxt.__vue_app__.config.globalProperties.$pinia._s.get('funnel')

      const connection = {
        source: sourceId,
        target: targetId,
        sourceHandle: sourceHandle ?? null,
        targetHandle: null
      }

      const result = store.validateConnection(connection)
      if (result.valid) {
        store.addEdge(connection)
      }

      return result
    },
    { sourceId, targetId, sourceHandle }
  )
}

export const connectNodesWithResult = async (
  page: Page,
  sourceId: string,
  targetId: string,
  sourceHandle?: string
): Promise<{ valid: boolean; error?: string }> =>
  page.evaluate(
    ({ sourceId, targetId, sourceHandle }) => {
      const store = (window as any).__nuxt.__vue_app__.config.globalProperties.$pinia._s.get('funnel')

      const connection = {
        source: sourceId,
        target: targetId,
        sourceHandle: sourceHandle ?? null,
        targetHandle: null
      }

      const result = store.validateConnection(connection)
      if (result.valid) {
        store.addEdge(connection)
      }

      return result
    },
    { sourceId, targetId, sourceHandle }
  )

export const waitForAutoSave = (page: Page) =>
  page.waitForTimeout(300)

export const waitForCanvasReady = (page: Page) =>
  page.waitForSelector(CANVAS_READY, { timeout: 15_000 })

export const getNodeIds = (page: Page): Promise<string[]> =>
  page.evaluate(() => {
    const store = (window as any).__nuxt.__vue_app__.config.globalProperties.$pinia._s.get('funnel')
    return store.nodes.map((n: any) => n.id)
  })

export const getNodeTypes = (page: Page): Promise<string[]> =>
  page.evaluate(() => {
    const store = (window as any).__nuxt.__vue_app__.config.globalProperties.$pinia._s.get('funnel')
    return store.nodes.map((n: any) => n.type)
  })
