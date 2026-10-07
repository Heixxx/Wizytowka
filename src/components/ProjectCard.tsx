import { type CSSProperties } from 'react'
import type { Project } from '../types.ts'
import { Icon } from './Icons.tsx'
import ProjectMedia from './ProjectMedia.tsx'

interface ProjectCardProps {
  project: Project
  reverse?: boolean
}

function ProjectStatus({ progress }: { progress?: number }) {
  const hasProgress = typeof progress === 'number'

  return (
    <div className="status-line">
      <span className="badge">
        <span className="badge__dot" />W trakcie
      </span>
      {hasProgress && (
        <div
          className="progress"
          role="progressbar"
          aria-label="Postęp prac"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span className="progress__track">
            <span className="progress__fill" style={{ '--value': `${progress}%` } as CSSProperties} />
          </span>
          <span className="progress__value">{progress}%</span>
        </div>
      )}
    </div>
  )
}

export default function ProjectCard({ project, reverse = false }: ProjectCardProps) {
  const inProgress = project.status === 'in-progress'

  return (
    <div className={`project-slot${reverse ? ' project-slot--reverse' : ''}`} data-aos="fade-up">
      <article className={`project${inProgress ? ' project--progress' : ''}`}>
        <div className="project__surface glow">
          <ProjectMedia project={project} />
          <div className="project__body">
            <div className="project__heading">
              <h4 className="project__title">{project.title}</h4>
              {project.year && <span className="project__year">{project.year}</span>}
            </div>
            {inProgress && <ProjectStatus progress={project.progress} />}
            <p className="project__description">{project.description}</p>
            {project.tags && project.tags.length > 0 && (
              <ul className="tags" aria-label="Technologie">
                {project.tags.map((tag) => (
                  <li className="tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {(project.demo || project.repo) && (
              <div className="project__links">
                {project.demo && (
                  <a className="link" href={project.demo} target="_blank" rel="noreferrer">
                    Zobacz online
                    <Icon name="arrowUpRight" size={16} />
                  </a>
                )}
                {project.repo && (
                  <a className="link" href={project.repo} target="_blank" rel="noreferrer">
                    Kod źródłowy
                    <Icon name="github" size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
