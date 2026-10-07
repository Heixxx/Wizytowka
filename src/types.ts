export type ProjectStatus = 'done' | 'in-progress'

export type MediaView = 'gallery' | 'page'

export type ThesisLevel = 'engineer' | 'master' | 'doctorate'

export interface Settings {
  screenshotService?: (url: string) => string
}

export interface ProfileDetail {
  label: string
  value: string
}

export interface Profile {
  name: string
  role: string
  headline: string
  tagline: string
  email: string
  phone?: string
  location?: string
  website?: string
  github?: string
  about: string[]
  details: ProfileDetail[]
  stack: string[]
}

export interface Project {
  title: string
  year?: string
  status?: ProjectStatus
  progress?: number
  description: string
  tags?: string[]
  view?: MediaView
  images?: string[]
  pageUrl?: string
  pageImage?: string
  demo?: string
  repo?: string
  featured?: boolean
}

export interface Thesis {
  degree: string
  level: ThesisLevel
  upcoming?: boolean
  title: string
  university?: string
  field?: string
  specialization?: string
  year?: string
  supervisor?: string
  grade?: string
  abstract?: string
  keywords?: string[]
  images?: string[]
  pdf?: string
  repo?: string
}
