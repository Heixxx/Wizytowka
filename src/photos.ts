const files = import.meta.glob<string>('./photos/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const prefix = './photos/'
const collator = new Intl.Collator('pl', { numeric: true, sensitivity: 'base' })

const entries = Object.entries(files)
  .map(([key, url]) => {
    const path = key.slice(prefix.length).toLowerCase()
    const slash = path.lastIndexOf('/')
    return { path, folder: slash === -1 ? '' : path.slice(0, slash), url }
  })
  .sort((a, b) => collator.compare(a.path, b.path))

const byPath = new Map(entries.map((entry) => [entry.path, entry.url]))

const isDirect = (source: string) => /^(https?:|data:|\/)/.test(source)

const normalize = (source: string) =>
  source
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(\.?\/)+|\/+$/g, '')
    .toLowerCase()

export const photo = (source = '') => {
  if (!source) return ''
  if (isDirect(source)) return source
  return byPath.get(normalize(source)) ?? ''
}

export const photos = (sources: string[] = []) => {
  const result = sources.flatMap((source) => {
    if (isDirect(source)) return [source]
    const target = normalize(source)
    const file = byPath.get(target)
    if (file) return [file]
    return entries.filter((entry) => entry.folder === target).map((entry) => entry.url)
  })

  return [...new Set(result)]
}
