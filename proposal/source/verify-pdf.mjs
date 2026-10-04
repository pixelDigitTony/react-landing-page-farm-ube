import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { proposal } from './content.mjs'

// Document-only QA uses bundled dependencies; no application packages are added.
const python = process.env.PROPOSAL_PYTHON ?? path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe')
const result = spawnSync(python, ['proposal/source/verify_pdf.py'], {
  input: JSON.stringify(proposal),
  encoding: 'utf8',
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
})
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
