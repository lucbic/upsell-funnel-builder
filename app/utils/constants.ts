import { MarkerType } from '@vue-flow/core'

export const getConstants = () =>
  ({
    GRID_SPACING: 25,
    NODE_WIDTH: 200,
    NODE_HEIGHT: 75,
    KEYBOARD_INSERT_NODE_GAP: 75,
    DURATION: {
      FIT_VIEW: 300,
      LOADING_DELAY: 350,
      ZOOM_TRANSITION: 100
    },
    EDGE_DEFAULTS: {
      type: 'smoothstep',
      selectable: true,
      deletable: true,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
      }
    },
    STORAGE_KEY_PREFIX: 'funnel_',
    STORAGE_INDEX_KEY: 'funnel_index',
    AUTO_SAVE_DEBOUNCE_MS: 200
  }) as const
