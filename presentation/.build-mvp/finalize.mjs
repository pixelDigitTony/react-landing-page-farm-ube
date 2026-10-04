import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const skillDir = 'C:/Users/USER/.codex/plugins/cache/openai-primary-runtime/presentations/26.921.10847/skills/presentations'
process.env.RUNTIME_NODE_MODULES ??= 'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href)
const inputs = JSON.parse(await fs.readFile('presentation/.build-mvp/finalization-inputs.json', 'utf8'))
const finalPath = process.env.MVP_FINAL_PPTX ? path.resolve(process.env.MVP_FINAL_PPTX) : inputs.finalPath
await fs.mkdir(path.dirname(finalPath), { recursive: true })
const { expectedSlideSizeEmu, ...config } = inputs
const result = await finalizePresentation({
  ...config,
  candidatePath: path.resolve('presentation/.build-mvp/candidate.pptx'),
  finalPath,
  pythonExecutable: 'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', expectedSlideSizeEmu, '--validate-heading-fit', '--validate-bullet-geometry', ...inputs.requiredNativeTableOwnerSlides.flatMap(n => ['--require-native-table-slide', String(n)])],
  verifyArtifactToolImport: true,
  receiptPath: path.resolve('presentation/.build-mvp/' + path.basename(finalPath) + '.validation.json'),
})
console.log(JSON.stringify(result, null, 2))
