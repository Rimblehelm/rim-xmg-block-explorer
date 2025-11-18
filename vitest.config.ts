// Configure Vitest to only run unit tests (avoid picking up Playwright e2e specs).
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Only run files that end with `.test.ts` under `tests/` or `src/`.
		include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
		// Run in Node environment for API/unit tests.
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			reportsDirectory: 'coverage',
		},
	},
})
