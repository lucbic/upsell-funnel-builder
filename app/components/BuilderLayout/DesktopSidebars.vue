<template>
  <UDashboardSidebar
    id="palette"
    side="left"
    role="complementary"
    class="bg-elevated/25"
    :default-size="18"
    :toggle="false"
    aria-label="Node palette"
  >
    <NodePalette />
  </UDashboardSidebar>

  <UDashboardSidebar
    id="default"
    :default-size="18"
    side="right"
    role="complementary"
    class="bg-elevated/25 border-default border-l"
    :toggle="false"
    aria-label="Funnel manager"
  >
    <FunnelManager />
  </UDashboardSidebar>
</template>
