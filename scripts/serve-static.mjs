#!/usr/bin/env node
/**
 * Serves the static build output with proper baseURL path structure.
 * Creates .output/serve/the-signal/ folder to match the GitHub Pages deployment.
 */
import { spawn } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const outputDir = join(rootDir, '.output', 'public')
const serveDir = join(rootDir, '.output', 'serve')
const targetDir = join(serveDir, 'the-signal')

// Clean and create serve directory
if (existsSync(serveDir)) {
  rmSync(serveDir, { recursive: true, force: true })
}
mkdirSync(targetDir, { recursive: true })

// Copy build output to the-signal subfolder
cpSync(outputDir, targetDir, { recursive: true })

console.log('✓ Created serve folder structure')
console.log(`  Serving from: ${serveDir}`)

// Start serve
const server = spawn('npx', ['serve', serveDir, '-l', '3000'], {
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
