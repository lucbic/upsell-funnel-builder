import { breakpointsTailwind } from '@vueuse/core'

export const useDevice = createSharedComposable(() => {
  const breakpoints = useBreakpoints(breakpointsTailwind, {
    ssrWidth: 768
  })

  return {
    isMobile: breakpoints.smaller('md'),
    isTablet: breakpoints.between('md', 'lg'),
    isDesktop: breakpoints.greaterOrEqual('lg')
  }
})
