import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockToastAdd = vi.fn()
mockNuxtImport('useToast', () => () => ({
  add: mockToastAdd
}))
mockNuxtImport(
  'useDebounceFn',
  () => (fn: () => void) => fn
)

const mockHandleError = vi.fn(
  (
    _title: string,
    _description: string,
    error?: unknown,
    options?: { rethrow?: boolean }
  ) => {
    if (options?.rethrow) throw error
  }
)
mockNuxtImport('useErrorHandler', () => () => ({
  handleError: mockHandleError
}))

describe('useFunnelCanvasStore', () => {
  let store: ReturnType<
    (typeof import('~/stores/funnelCanvas'))['useFunnelCanvasStore']
  >
  let storage: Record<string, string>

  beforeEach(async () => {
    storage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      })
    })
    vi.stubGlobal(
      'useStorage',
      <T>(_key: string, defaultValue: T) =>
        ref(defaultValue)
    )

    mockToastAdd.mockClear()
    mockHandleError.mockClear()

    const { useFunnelCanvasStore: useFunnelCanvasStore } =
      await import('~/stores/funnelCanvas')
    store = useFunnelCanvasStore()
    store.resetToNewFunnel()
  })

  describe('initial state', () => {
    it('has empty nodes', () => {
      expect(store.nodes).toEqual([])
    })

    it('has empty edges', () => {
      expect(store.edges).toEqual([])
    })

    it('has default funnel name', () => {
      expect(store.funnelName).toBe('Untitled Funnel')
    })

    it('has zero node counts', () => {
      expect(store.nodeTypeCounts).toEqual({
        upsell: 0,
        downsell: 0
      })
    })

    it('has null currentFunnelId', () => {
      expect(store.currentFunnelId).toBeNull()
    })

    it('isLoading is false', () => {
      expect(store.isLoading).toBe(false)
    })
  })

  describe('hasContent', () => {
    it('false for new funnel', () => {
      expect(store.hasContent).toBe(false)
    })

    it('true with nodes', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      expect(store.hasContent).toBe(true)
    })

    it('true with custom name', () => {
      store.funnelName = 'My Funnel'
      expect(store.hasContent).toBe(true)
    })

    it('false after reset', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.resetToNewFunnel()
      expect(store.hasContent).toBe(false)
    })
  })

  describe('createNode', () => {
    it('increments nodeIdCounter', () => {
      store.createNode('sales-page', { x: 10, y: 20 })
      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0]!.id).toBe('node-1')
    })

    it('sets correct type and position', () => {
      store.createNode('order-page', { x: 100, y: 200 })
      expect(store.nodes[0]!.type).toBe('order-page')
      expect(store.nodes[0]!.position).toEqual({
        x: 100,
        y: 200
      })
    })

    it('auto-increments upsell titles', () => {
      store.createNode('upsell', { x: 0, y: 0 })
      store.createNode('upsell', { x: 0, y: 0 })
      expect(store.nodes[0]!.data!.title).toBe('Upsell 1')
      expect(store.nodes[1]!.data!.title).toBe('Upsell 2')
    })

    it('auto-increments downsell titles', () => {
      store.createNode('downsell', { x: 0, y: 0 })
      store.createNode('downsell', { x: 0, y: 0 })
      expect(store.nodes[0]!.data!.title).toBe('Downsell 1')
      expect(store.nodes[1]!.data!.title).toBe('Downsell 2')
    })

    it('does not auto-increment non-incrementing types', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      expect(store.nodes[0]!.data!.title).toBe('Sales Page')
      expect(
        store.nodes[0]!.data!.sequenceNumber
      ).toBeUndefined()
    })

    it('sets ariaLabel', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      expect(store.nodes[0]!.ariaLabel).toBe(
        'Sales Page - Sales Page'
      )
    })

    it('sets nodeData with icon and primaryButtonLabel', () => {
      store.createNode('order-page', { x: 0, y: 0 })
      expect(store.nodes[0]!.data!.icon).toBe(
        'i-lucide-shopping-cart'
      )
      expect(store.nodes[0]!.data!.primaryButtonLabel).toBe(
        'Complete Order'
      )
    })
  })

  describe('deleteNode', () => {
    it('removes node from array', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      const id = store.nodes[0]!.id
      store.deleteNode(id)
      expect(store.nodes).toHaveLength(0)
    })

    it('cascades edge deletion', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.createNode('order-page', { x: 100, y: 0 })
      const spId = store.nodes[0]!.id
      const opId = store.nodes[1]!.id

      store.addEdge({
        source: spId,
        target: opId,
        sourceHandle: null,
        targetHandle: null
      })
      expect(store.edges).toHaveLength(1)

      store.deleteNode(spId)
      expect(store.edges).toHaveLength(0)
    })

    it('decrements nodeTypeCounts for auto-increment types', () => {
      store.createNode('upsell', { x: 0, y: 0 })
      store.createNode('upsell', { x: 0, y: 0 })
      expect(store.nodeTypeCounts.upsell).toBe(2)

      store.deleteNode(store.nodes[0]!.id)
      expect(store.nodeTypeCounts.upsell).toBe(1)
    })

    it('handles non-existent ID gracefully', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.deleteNode('nonexistent')
      expect(store.nodes).toHaveLength(1)
    })
  })

  describe('addEdge', () => {
    it('creates edge with smoothstep type', () => {
      store.addEdge({
        source: 'a',
        target: 'b',
        sourceHandle: null,
        targetHandle: null
      })
      expect(store.edges[0]!.type).toBe('smoothstep')
    })

    it('includes arrow marker', () => {
      store.addEdge({
        source: 'a',
        target: 'b',
        sourceHandle: null,
        targetHandle: null
      })
      expect(store.edges[0]!.markerEnd).toBeDefined()
    })

    it('includes handles in edge', () => {
      store.addEdge({
        source: 'a',
        target: 'b',
        sourceHandle: 'accepted',
        targetHandle: null
      })
      expect(store.edges[0]!.sourceHandle).toBe('accepted')
    })
  })

  describe('validateConnection', () => {
    it('validates a valid connection', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.createNode('order-page', { x: 100, y: 0 })

      const result = store.validateConnection({
        source: store.nodes[0]!.id,
        target: store.nodes[1]!.id,
        sourceHandle: null,
        targetHandle: null
      })
      expect(result.valid).toBe(true)
    })

    it('rejects invalid connection', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.createNode('upsell', { x: 100, y: 0 })

      const result = store.validateConnection({
        source: store.nodes[0]!.id,
        target: store.nodes[1]!.id,
        sourceHandle: null,
        targetHandle: null
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('resetToNewFunnel', () => {
    it('clears all state to defaults', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.funnelName = 'Custom Name'
      store.resetToNewFunnel()

      expect(store.nodes).toEqual([])
      expect(store.edges).toEqual([])
      expect(store.funnelName).toBe('Untitled Funnel')
      expect(store.currentFunnelId).toBeNull()
      expect(store.nodeTypeCounts).toEqual({
        upsell: 0,
        downsell: 0
      })
    })
  })

  describe('loadState', () => {
    it('bulk-sets all canvas state', () => {
      store.loadState({
        id: 'test-id',
        name: 'Test Funnel',
        nodes: [],
        edges: [],
        nodeTypeCounts: { upsell: 3, downsell: 1 },
        nodeIdCounter: 5
      })

      expect(store.currentFunnelId).toBe('test-id')
      expect(store.funnelName).toBe('Test Funnel')
      expect(store.nodeTypeCounts).toEqual({
        upsell: 3,
        downsell: 1
      })
      expect(store.nodeIdCounter).toBe(5)
    })
  })
})

describe('useFunnelPersistenceStore', () => {
  let store: ReturnType<
    (typeof import('~/stores/funnelCanvas'))['useFunnelCanvasStore']
  >
  let persistenceStore: ReturnType<
    (typeof import('~/stores/funnelPersistence'))['useFunnelPersistenceStore']
  >
  let storage: Record<string, string>

  beforeEach(async () => {
    storage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      })
    })
    vi.stubGlobal(
      'useStorage',
      <T>(_key: string, defaultValue: T) =>
        ref(defaultValue)
    )

    mockToastAdd.mockClear()
    mockHandleError.mockClear()

    const { useFunnelCanvasStore: useFunnelCanvasStore } =
      await import('~/stores/funnelCanvas')
    const { useFunnelPersistenceStore } =
      await import('~/stores/funnelPersistence')

    store = useFunnelCanvasStore()
    store.resetToNewFunnel()
    persistenceStore = useFunnelPersistenceStore()
  })

  describe('saveFunnel', () => {
    it('writes to localStorage', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      persistenceStore.saveFunnel()

      expect(localStorage.setItem).toHaveBeenCalled()
      expect(store.currentFunnelId).toBeTruthy()
    })

    it('updates savedFunnels index', () => {
      persistenceStore.saveFunnel()
      expect(
        persistenceStore.savedFunnels.length
      ).toBeGreaterThanOrEqual(1)
    })

    it('calls handleError on storage failure', () => {
      vi.mocked(
        localStorage.setItem
      ).mockImplementationOnce(() => {
        throw new Error('QuotaExceeded')
      })
      persistenceStore.saveFunnel()
      expect(mockHandleError).toHaveBeenCalledWith(
        'Storage Error',
        'Failed to save funnel. Storage may be full.',
        expect.any(Error)
      )
    })
  })

  describe('loadFunnel', () => {
    it('restores nodes and edges', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      persistenceStore.saveFunnel()
      const savedId = store.currentFunnelId!

      store.resetToNewFunnel()
      expect(store.nodes).toHaveLength(0)

      persistenceStore.loadFunnel(savedId)
      expect(store.nodes).toHaveLength(1)
      expect(store.currentFunnelId).toBe(savedId)
    })

    it('shows toast on success (non-silent)', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      persistenceStore.saveFunnel()
      const savedId = store.currentFunnelId!

      mockToastAdd.mockClear()
      persistenceStore.loadFunnel(savedId)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Funnel Loaded' })
      )
    })

    it('silent mode suppresses toast', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      persistenceStore.saveFunnel()
      const savedId = store.currentFunnelId!

      mockToastAdd.mockClear()
      persistenceStore.loadFunnel(savedId, { silent: true })

      const loadToasts = mockToastAdd.mock.calls.filter(
        args =>
          (args[0] as { title: string })?.title ===
          'Funnel Loaded'
      )
      expect(loadToasts).toHaveLength(0)
    })

    it('calls handleError for missing funnel', () => {
      persistenceStore.loadFunnel('nonexistent')
      expect(mockHandleError).toHaveBeenCalledWith(
        'Load Error',
        'Could not find the requested funnel',
        undefined,
        expect.objectContaining({ toast: true })
      )
    })

    it('silent mode suppresses error toast', () => {
      mockHandleError.mockClear()
      persistenceStore.loadFunnel('nonexistent', {
        silent: true
      })
      expect(mockHandleError).toHaveBeenCalledWith(
        'Load Error',
        'Could not find the requested funnel',
        undefined,
        expect.objectContaining({ toast: false })
      )
    })
  })

  describe('deleteFunnel', () => {
    it('removes from storage', () => {
      persistenceStore.saveFunnel()
      const id = store.currentFunnelId!
      persistenceStore.deleteFunnel(id)
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        `funnel_${id}`
      )
    })

    it('updates savedFunnels index', () => {
      persistenceStore.saveFunnel()
      const id = store.currentFunnelId!
      const countBefore =
        persistenceStore.savedFunnels.length
      persistenceStore.deleteFunnel(id)
      expect(persistenceStore.savedFunnels.length).toBe(
        countBefore - 1
      )
    })

    it('resets if deleting current funnel', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      persistenceStore.saveFunnel()
      const id = store.currentFunnelId!
      persistenceStore.deleteFunnel(id)
      expect(store.currentFunnelId).toBeNull()
      expect(store.nodes).toHaveLength(0)
    })
  })

  describe('createNewFunnel', () => {
    it('resets when skipConfirmation=true', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      const result = persistenceStore.createNewFunnel(true)
      expect(result).toBe(true)
      expect(store.nodes).toHaveLength(0)
    })

    it('returns false when has content and no confirmation', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      const result = persistenceStore.createNewFunnel(false)
      expect(result).toBe(false)
      expect(store.nodes).toHaveLength(1)
    })

    it('shows toast on success', () => {
      mockToastAdd.mockClear()
      persistenceStore.createNewFunnel(true)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Funnel Created'
        })
      )
    })
  })

  describe('exportFunnel', () => {
    it('creates blob and triggers download', () => {
      const mockUrl = 'blob:mock'
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => mockUrl),
        revokeObjectURL: vi.fn()
      })
      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      )

      store.funnelName = 'My Test Funnel'
      persistenceStore.exportFunnel()

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockLink.click).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(
        mockUrl
      )
    })

    it('sanitizes filename', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:x'),
        revokeObjectURL: vi.fn()
      })
      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      )

      store.funnelName = 'My Funnel! @#$'
      persistenceStore.exportFunnel()

      // "My Funnel! @#$" → each non-alphanumeric replaced with _
      // regex /[^a-z0-9]/gi matches: space, !, space, @, #, $
      expect(mockLink.download).toMatch(
        /^My_Funnel.*\.json$/
      )
    })
  })

  describe('importFunnel', () => {
    const createMockFile = (
      data: Record<string, unknown>
    ) =>
      new File([JSON.stringify(data)], 'test.json', {
        type: 'application/json'
      })

    it('parses JSON and restores state', async () => {
      const file = createMockFile({
        name: 'Imported Funnel',
        nodes: [
          {
            id: 'n1',
            type: 'sales-page',
            position: { x: 0, y: 0 },
            data: {
              title: 'Sales Page',
              icon: 'i-lucide-presentation',
              nodeType: 'sales-page'
            }
          }
        ],
        edges: [],
        nodeTypeCounts: { upsell: 0, downsell: 0 },
        nodeIdCounter: 1
      })

      await persistenceStore.importFunnel(file)
      expect(store.funnelName).toBe('Imported Funnel')
      expect(store.nodes).toHaveLength(1)
    })

    it('generates new ID on import', async () => {
      const file = createMockFile({
        id: 'old-id',
        name: 'Test',
        nodes: [],
        edges: [],
        nodeTypeCounts: {},
        nodeIdCounter: 0
      })

      await persistenceStore.importFunnel(file)
      expect(store.currentFunnelId).not.toBe('old-id')
      expect(store.currentFunnelId).toContain('funnel_')
    })

    it('rejects invalid format', async () => {
      const file = createMockFile({ invalid: true })

      await persistenceStore.importFunnel(file)
      expect(mockHandleError).toHaveBeenCalledWith(
        'Import Error',
        'Invalid funnel file format',
        expect.any(Error)
      )
    })
  })
})
