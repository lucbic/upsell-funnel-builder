import { chromium, type Browser, type Page } from 'playwright-core'

let browser: Browser | null = null

export const launchBrowser = async () => {
  if (!browser) {
    browser = await chromium.launch({ headless: true })
  }
  return browser
}

export const closeBrowser = async () => {
  await browser?.close()
  browser = null
}

export const createPage = async (): Promise<Page> => {
  const b = await launchBrowser()
  const context = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto('http://localhost:3000')
  await page.waitForSelector(
    '[aria-label="Funnel builder canvas"]:not([aria-busy="true"])',
    { timeout: 15_000 },
  )

  return page
}
