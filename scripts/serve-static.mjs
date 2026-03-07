#!/usr/bin/env node
/**
 * Serves the static build output for local testing.
 * The site is built with NUXT_APP_BASE_URL=/ so assets are at /_nuxt/.
 * Serve directly from .output/public so all paths resolve correctly.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const outputDir = join(rootDir, '.output', 'public')

if (!existsSync(outputDir)) {
  console.error('Build output not found at .output/public. Run `pnpm generate` first.')
  process.exit(1)
}

console.log('✓ Serving static build output')
console.log(`  Serving from: ${outputDir}`)

// Start serve
const server = spawn('npx', ['serve', outputDir, '-l', '3000'], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: true,
  windowsHide: false,
})

server.on('close', (code) => {
  process.exit(code ?? 0)
})

server.on('error', (err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
