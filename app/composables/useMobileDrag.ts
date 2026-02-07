type DragState = {
  isDragging: Ref<boolean>
  nodeType: Ref<Funnel.NodeType | null>
  position: Ref<{ x: number; y: number }>
  pendingDrop: Ref<{ nodeType: Funnel.NodeType; x: number; y: number } | null>
}

export const useMobileDrag = createSharedComposable((): DragState & {
  startDrag: (type: Funnel.NodeType, pos: { x: number; y: number }) => void
  consumeDrop: () => { nodeType: Funnel.NodeType; x: number; y: number } | null
} => {
  const isDragging = ref(false)
  const nodeType = ref<Funnel.NodeType | null>(null)
  const position = ref({ x: 0, y: 0 })
  const pendingDrop = ref<{ nodeType: Funnel.NodeType; x: number; y: number } | null>(null)

  const reset = () => {
    isDragging.value = false
    nodeType.value = null
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging.value) return
    e.preventDefault()
    const touch = e.touches[0]!
    position.value = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!isDragging.value) return
    const touch = e.changedTouches[0]!
    if (nodeType.value) {
      pendingDrop.value = {
        nodeType: nodeType.value,
        x: touch.clientX,
        y: touch.clientY
      }
    }
    reset()
  }

  const onTouchCancel = () => {
    if (!isDragging.value) return
    reset()
  }

  useEventListener(document, 'touchmove', onTouchMove, { passive: false })
  useEventListener(document, 'touchend', onTouchEnd)
  useEventListener(document, 'touchcancel', onTouchCancel)

  const startDrag = (type: Funnel.NodeType, pos: { x: number; y: number }) => {
    nodeType.value = type
    position.value = pos
    isDragging.value = true
  }

  const consumeDrop = () => {
    const drop = pendingDrop.value
    pendingDrop.value = null
    return drop
  }

  return {
    isDragging,
    nodeType,
    position,
    pendingDrop,
    startDrag,
    consumeDrop
  }
})
