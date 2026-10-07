import { useEffect, useRef } from 'react'

type Wave = [amplitude: number, frequency: number, phase: number]

interface Ridge {
  base: number
  alpha: number
  waves: Wave[]
}

const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789<>{}[]/=+*#$%'
const cell = 16
const fps = 30
const trail = 10
const density = 0.62
const span = 1600
const edgeBoost = 0.5
const glowStrength = 0.6
const minSpeed = 0.05
const maxSpeed = 0.14
const mutationRate = 0.002
const color = 'rgb(74, 123, 255)'
const headColor = 'rgb(214, 228, 255)'
const font = `${cell - 3}px 'IBM Plex Mono', ui-monospace, monospace`

const ridges: Ridge[] = [
  {
    base: 0.6,
    alpha: 0.06,
    waves: [
      [0.1, 1.3, 0.4],
      [0.05, 3.1, 2.1],
      [0.02, 7.3, 4.2],
    ],
  },
  {
    base: 0.74,
    alpha: 0.1,
    waves: [
      [0.09, 1.7, 2.6],
      [0.04, 4.2, 0.9],
      [0.015, 9.1, 1.7],
    ],
  },
  {
    base: 0.88,
    alpha: 0.16,
    waves: [
      [0.07, 2.2, 5.1],
      [0.03, 5.6, 3.3],
      [0.012, 11.4, 0.2],
    ],
  },
]

const ridgeAt = (ridge: Ridge, u: number) =>
  ridge.base -
  ridge.waves.reduce((sum, [amplitude, frequency, phase]) => sum + amplitude * Math.sin(u * frequency * Math.PI * 2 + phase), 0)

const randomGlyph = () => Math.floor(Math.random() * glyphs.length)

const prepare = (context: CanvasRenderingContext2D, ratio: number) => {
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.font = font
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
}

export default function MatrixHills() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const buffer = document.createElement('canvas')
    const bufferContext = buffer.getContext('2d')
    if (!canvas || !context || !bufferContext) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let field = new Uint16Array(0)
    let visible = new Int8Array(0)
    let baseAlpha = new Float32Array(0)
    let starts = new Int16Array(0)
    let heads = new Float32Array(0)
    let speeds = new Float32Array(0)
    let frame = 0
    let last = 0

    const drawCell = (index: number) => {
      const column = Math.floor(index / rows)
      const row = index - column * rows
      const x = column * cell
      const y = row * cell
      bufferContext.clearRect(x, y, cell, cell)
      if (baseAlpha[index] === 0) return
      bufferContext.globalAlpha = baseAlpha[index]
      bufferContext.fillText(glyphs[field[index]], x + cell / 2, y + cell / 2)
    }

    const mutate = (index: number) => {
      field[index] = randomGlyph()
      if (baseAlpha[index] > 0) drawCell(index)
    }

    const resetHead = (column: number) => {
      heads[column] = starts[column] - Math.random() * rows * 0.8
      speeds[column] = minSpeed + Math.random() * (maxSpeed - minSpeed)
    }

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = rect.width
      height = rect.height
      canvas.width = buffer.width = Math.round(width * ratio)
      canvas.height = buffer.height = Math.round(height * ratio)
      prepare(context, ratio)
      prepare(bufferContext, ratio)

      cols = Math.ceil(width / cell)
      rows = Math.ceil(height / cell)
      field = Uint16Array.from({ length: cols * rows }, randomGlyph)
      visible = new Int8Array(cols * rows)
      baseAlpha = new Float32Array(cols * rows)
      starts = new Int16Array(cols)
      heads = new Float32Array(cols)
      speeds = new Float32Array(cols)

      const tops = ridges.map((ridge) =>
        Int16Array.from({ length: cols }, (_, column) =>
          Math.max(0, Math.round(ridgeAt(ridge, (column * cell) / span) * rows)),
        ),
      )

      for (let column = 0; column < cols; column += 1) {
        starts[column] = Math.min(...tops.map((top) => top[column]))

        for (let row = starts[column]; row < rows; row += 1) {
          let layer = -1
          for (let index = 0; index < ridges.length; index += 1) {
            if (row >= tops[index][column]) layer = index
          }
          if (layer < 0) continue

          const index = column * rows + row
          const edge = row === tops[layer][column]
          visible[index] = 1
          if (edge || Math.random() < density) baseAlpha[index] = Math.min(1, ridges[layer].alpha + (edge ? edgeBoost : 0))
        }

        resetHead(column)
        heads[column] += Math.random() * rows
      }

      bufferContext.clearRect(0, 0, width, height)
      for (let index = 0; index < baseAlpha.length; index += 1) {
        if (baseAlpha[index] > 0) drawCell(index)
      }
    }

    const drawGlyph = (column: number, row: number) => {
      if (row < 0 || row >= rows) return
      const index = column * rows + row
      if (!visible[index]) return
      context.fillText(glyphs[field[index]], column * cell + cell / 2, row * cell + cell / 2)
    }

    const drawRain = () => {
      context.fillStyle = color
      for (let offset = 1; offset < trail; offset += 1) {
        context.globalAlpha = (1 - offset / trail) * glowStrength
        for (let column = 0; column < cols; column += 1) drawGlyph(column, Math.floor(heads[column]) - offset)
      }

      context.fillStyle = headColor
      context.globalAlpha = 0.9
      for (let column = 0; column < cols; column += 1) drawGlyph(column, Math.floor(heads[column]))
      context.globalAlpha = 1
    }

    const render = (rain: boolean) => {
      context.clearRect(0, 0, width, height)
      context.drawImage(buffer, 0, 0, width, height)
      if (rain) drawRain()
    }

    const step = () => {
      for (let column = 0; column < cols; column += 1) {
        const previous = Math.floor(heads[column])
        heads[column] += speeds[column]
        const row = Math.floor(heads[column])
        if (row !== previous && row >= 0 && row < rows) mutate(column * rows + row)
        if (heads[column] - trail > rows) resetHead(column)
      }

      const mutations = Math.ceil(field.length * mutationRate)
      for (let index = 0; index < mutations; index += 1) {
        mutate(Math.floor(Math.random() * field.length))
      }
    }

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (time - last < 1000 / fps) return
      last = time
      step()
      render(true)
    }

    const start = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(loop)
    }

    const stop = () => cancelAnimationFrame(frame)

    const resizeObserver = new ResizeObserver(() => {
      build()
      render(!reduced)
    })

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (reduced) return
      if (entry.isIntersecting) start()
      else stop()
    })

    resizeObserver.observe(canvas)
    visibilityObserver.observe(canvas)

    return () => {
      stop()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [])

  return <canvas className="hero__hills" ref={canvasRef} aria-hidden="true" />
}
