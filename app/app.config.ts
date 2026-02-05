export default defineAppConfig({
  ui: {
    card: {
      slots: {
        body: 'p-3!'
      }
    },
    toaster: {
      defaultVariants: {
        position: 'bottom-left'
      }
    },
    dashboardSidebar: {
      slots: {
        body: 'p-4!'
      }
    }
  }
})
