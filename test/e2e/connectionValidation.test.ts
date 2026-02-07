import type { Page } from 'playwright-core'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeBrowser, createPage, launchBrowser } from './setup'
import {
  addNodeByKeyboard,
  connectNodesWithResult,
  getEdgeCount,
  getNodeIds
} from './helpers'

describe('Connection Validation Feedback', () => {
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

  it('rejects outgoing connection from Thank You node', async () => {
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Thank You')

    const nodeIds = await getNodeIds(page)
    const [salesId, thankYouId] = nodeIds as [string, string]

    const result = await connectNodesWithResult(page, thankYouId, salesId)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Thank You')

    await expect(getEdgeCount(page)).resolves.toBe(0)
  })

  it('rejects incoming connection to Sales Page', async () => {
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')

    const nodeIds = await getNodeIds(page)
    const [salesId, orderId] = nodeIds as [string, string]

    const result = await connectNodesWithResult(page, orderId, salesId, 'accepted')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Sales Page')

    await expect(getEdgeCount(page)).resolves.toBe(0)
  })

  it('rejects second incoming connection to Order Page', async () => {
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')
    await addNodeByKeyboard(page, 'Upsell')

    const nodeIds = await getNodeIds(page)
    const [salesId, orderId, upsellId] = nodeIds as [string, string, string]

    const first = await connectNodesWithResult(page, salesId, orderId)
    expect(first.valid).toBe(true)
    await expect(getEdgeCount(page)).resolves.toBe(1)

    const second = await connectNodesWithResult(page, upsellId, orderId, 'accepted')
    expect(second.valid).toBe(false)
    expect(second.error).toContain('1 incoming')

    await expect(getEdgeCount(page)).resolves.toBe(1)
  })

  it('rejects duplicate connection on multi-handle node', async () => {
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Order Page')
    await addNodeByKeyboard(page, 'Upsell')
    await addNodeByKeyboard(page, 'Thank You')

    const nodeIds = await getNodeIds(page)
    const [salesId, orderId, upsellId, thankYouId] = nodeIds as [string, string, string, string]

    await connectNodesWithResult(page, salesId, orderId)
    const first = await connectNodesWithResult(page, orderId, upsellId, 'accepted')
    expect(first.valid).toBe(true)
    await expect(getEdgeCount(page)).resolves.toBe(2)

    // Same handle connection again
    const second = await connectNodesWithResult(page, orderId, thankYouId, 'accepted')
    expect(second.valid).toBe(false)
    expect(second.error).toContain('already has a connection')

    await expect(getEdgeCount(page)).resolves.toBe(2)
  })

  it('rejects Sales Page connecting to non-Order Page', async () => {
    await addNodeByKeyboard(page, 'Sales Page')
    await addNodeByKeyboard(page, 'Thank You')

    const nodeIds = await getNodeIds(page)
    const [salesId, thankYouId] = nodeIds as [string, string]

    const result = await connectNodesWithResult(page, salesId, thankYouId)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Order Page')

    await expect(getEdgeCount(page)).resolves.toBe(0)
  })
})
