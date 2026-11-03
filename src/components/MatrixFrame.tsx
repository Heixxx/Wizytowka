import { useEffect, useRef } from 'react'

const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789<>{}[]/=+*#$%'
const cell = 14
const fps = 30
const trail = 16
const mutationRate = 0.04
const color = 'rgb(74, 123, 255)'
const headColor = 'rgb(214, 228, 255)'
const font = `${cell - 3}px 'IBM Plex Mono', ui-monospace, monospace`

const randomGlyph = () => Math.floor(Math.random() * glyphs.length)

export default function MatrixFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let path: [x: number, y: number][] = []
    let field = new Uint16Array(0)
    let alpha = new Float32Array(0)
    let heads = new Float32Array(0)
    let speeds = new Float32Array(0)
    let width = 0
    let height = 0
    let frame = 0
    let last = 0

    const build = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.font = font
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const cols = Math.max(2, Math.round(width / cell))
      const rows = Math.max(2, Math.round(height / cell))
      const w = width / cols
      const h = height / rows
      const at = (column: number, row: number): [number, number] => [column * w + w / 2, row * h + h / 2]

      path = []
      for (let column = 0; column < cols; column += 1) path.push(at(column, 0))
      for (let row = 1; row < rows; row += 1) path.push(at(cols - 1, row))
      for (let column = cols - 2; column >= 0; column -= 1) path.push(at(column, rows - 1))
      for (let row = rows - 2; row > 0; row -= 1) path.push(at(0, row))

      field = Uint16Array.from({ length: path.length }, randomGlyph)
      alpha = Float32Array.from({ length: path.length }, () => (Math.random() < 0.7 ? 0.14 + Math.random() * 0.22 : 0))

      const comets = Math.max(3, Math.round(path.length / 45))
      heads = Float32Array.from({ length: comets }, (_, index) => (index / comets) * path.length)
      speeds = Float32Array.from({ length: comets }, () => 0.35 + Math.random() * 0.35)
    }

    const render = () => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = color
      for (let index = 0; index < path.length; index += 1) {
        if (alpha[index] === 0) continue
        context.globalAlpha = alpha[index]
        context.fillText(glyphs[field[index]], path[index][0], path[index][1])
      }

      for (let comet = 0; comet < heads.length; comet += 1) {
        const head = Math.floor(heads[comet])
        for (let offset = trail - 1; offset >= 0; offset -= 1) {
          const index = (((head - offset) % path.length) + path.length) % path.length
          context.fillStyle = offset === 0 ? headColor : color
          context.globalAlpha = offset === 0 ? 1 : (1 - offset / trail) * 0.85
          context.fillText(glyphs[field[index]], path[index][0], path[index][1])
        }
      }
      context.globalAlpha = 1
    }

    const step = () => {
      for (let comet = 0; comet < heads.length; comet += 1) {
        const previous = Math.floor(heads[comet])
        heads[comet] = (heads[comet] + speeds[comet]) % path.length
        if (Math.floor(heads[comet]) !== previous) field[Math.floor(heads[comet])] = randomGlyph()
      }

      const mutations = Math.ceil(path.length * mutationRate)
      for (let index = 0; index < mutations; index += 1) {
        field[Math.floor(Math.random() * path.length)] = randomGlyph()
      }
    }

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (time - last < 1000 / fps) return
      last = time
      step()
      render()
    }

    const resizeObserver = new ResizeObserver(() => {
      build()
      render()
    })

    resizeObserver.observe(canvas)
    if (!reduced) frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas className="matrix-frame" ref={canvasRef} aria-hidden="true" />
}
