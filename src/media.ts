import manifest from './screenshots.json'
import { settings } from './content.ts'
import { photo } from './photos.ts'
import type { Project } from './types.ts'

const screenshots: Record<string, string> = manifest

export const getPageImage = (project: Project) => {
  if (project.pageImage) return photo(project.pageImage)
  if (!project.pageUrl) return ''
  return screenshots[project.pageUrl] ?? settings.screenshotService?.(project.pageUrl) ?? ''
}
