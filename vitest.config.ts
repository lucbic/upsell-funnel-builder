import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '~': fileURLToPath(
              new URL('./app', import.meta.url)
            )
          }
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node'
        }
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
          testTimeout: 30_000,
          hookTimeout: 30_000,
          globalSetup: ['test/e2e/globalSetup.ts'],
          pool: 'forks',
          fileParallelism: false
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(
                new URL('.', import.meta.url)
              ),
              domEnvironment: 'happy-dom'
            }
          }
        }
      })
    ]
  }
})
