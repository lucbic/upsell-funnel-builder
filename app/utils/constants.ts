export const useConstants = () =>
  ({
    GRID_SPACING: 25,
    NODE_WIDTH: 200,
    NODE_HEIGHT: 75,
    KEYBOARD_INSERT_NODE_GAP: 75,
    DURATION: {
      FIT_VIEW: 300,
      LOADING_DELAY: 350,
      ZOOM_TRANSITION: 100
    }
  }) as const
