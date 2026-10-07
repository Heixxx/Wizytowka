import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from 'playwright'
import { projects } from '../src/content.ts'
import { slugify } from '../src/utils.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'public', 'screenshots')
const manifestPath = path.join(root, 'src', 'screenshots.json')

const scrollThrough = async (page: Page) => {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
    window.scrollTo(0, 0)
  })
}

const targets = projects.filter((project) => project.pageUrl)

if (targets.length === 0) {
  console.log('Żaden projekt nie ma ustawionego pola pageUrl.')
  process.exit(0)
}

await mkdir(outputDir, { recursive: true })

const manifest: Record<string, string> = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

for (const project of targets) {
  const pageUrl = project.pageUrl as string
  const fileName = `${slugify(project.title)}.jpg`

  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60000 })
    await scrollThrough(page)
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outputDir, fileName), fullPage: true, type: 'jpeg', quality: 82 })
    manifest[pageUrl] = `/screenshots/${fileName}`
    console.log(`Zapisano: ${project.title} -> public/screenshots/${fileName}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Nie udało się wykonać zrzutu dla „${project.title}”: ${message}`)
  }
}

await browser.close()
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Zaktualizowano src/screenshots.json')
