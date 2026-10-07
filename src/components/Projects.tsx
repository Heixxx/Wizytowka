import { projects } from '../content.ts'
import type { ProjectStatus } from '../types.ts'
import { pad } from '../utils.ts'
import Piece from './Piece.tsx'
import ProjectCard from './ProjectCard.tsx'

const groups: { status: ProjectStatus; title: string }[] = [
  { status: 'done', title: 'Zrealizowane' },
  { status: 'in-progress', title: 'W trakcie' },
]

const grouped = groups
  .map((group) => {
    const items = projects.filter((project) => (project.status ?? 'done') === group.status)
    return { ...group, items: [...items.filter((project) => project.featured), ...items.filter((project) => !project.featured)] }
  })
  .filter((group) => group.items.length > 0)

export default function Projects() {
  let position = 0

  return (
    <Piece id="projekty" title="Projekty" tone="black" tilt="right" layer={2}>
      {grouped.map((group) => {
        const { items } = group

        return (
          <div className={`group group--${group.status}`} key={group.status}>
            <div className="group__header" data-aos="fade-up">
              <h3 className="group__title">{group.title}</h3>
              <span className="group__count">{pad(items.length)}</span>
              <span className="group__line" aria-hidden="true" />
            </div>
            <div className="projects">
              {items.map((project) => {
                const reverse = position % 2 === 1
                position += 1
                return <ProjectCard key={project.title} project={project} reverse={reverse} />
              })}
            </div>
          </div>
        )
      })}
    </Piece>
  )
}
