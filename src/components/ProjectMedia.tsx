import { useState } from 'react'
import { getPageImage } from '../media.ts'
import { photos } from '../photos.ts'
import type { MediaView, Project } from '../types.ts'
import Gallery from './Gallery.tsx'
import PageScroller from './PageScroller.tsx'

interface ProjectMediaProps {
  project: Project
}

const labels: Record<MediaView, string> = { gallery: 'Zdjęcia', page: 'Cała strona' }

export default function ProjectMedia({ project }: ProjectMediaProps) {
  const images = photos(project.images)
  const pageImage = getPageImage(project)
  const views = [images.length > 0 && 'gallery', pageImage && 'page'].filter(Boolean) as MediaView[]
  const [view, setView] = useState<MediaView | undefined>(
    project.view && views.includes(project.view) ? project.view : views[0],
  )

  return (
    <div className={`project__media project__media--${view ?? 'empty'}`}>
      {view === 'gallery' && <Gallery images={images} title={project.title} />}
      {view === 'page' && (
        <PageScroller
          src={pageImage}
          url={project.pageUrl || project.demo}
          title={project.title}
        />
      )}
      {!view && (
        <span className="project__art" aria-hidden="true">
          <span className="project__mark">{project.title.charAt(0)}</span>
        </span>
      )}
      {views.length > 1 && (
        <div className="media-switch" role="group" aria-label="Rodzaj podglądu">
          {views.map((option) => (
            <button
              type="button"
              key={option}
              aria-pressed={view === option}
              onClick={() => setView(option)}
            >
              {labels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
