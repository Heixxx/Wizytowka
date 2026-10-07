export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

export const pad = (value: number | string) => String(value).padStart(2, '0')

export const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
