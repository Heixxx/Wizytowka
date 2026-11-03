import { useEffect, useRef } from 'react'

type Wave = [amplitude: number, frequency: number, phase: number]
type Vec = [x: number, y: number, z: number]
type Point2 = [x: number, y: number]

interface Ridge {
  base: number
  alpha: number
  waves: Wave[]
}

interface Solid {
  vertices: Vec[]
  faces: number[][]
  normals: Vec[]
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
const objectColor = 'rgb(255, 36, 58)'
const objectEdgeColor = 'rgb(255, 128, 140)'
const objectHotColor = 'rgb(255, 224, 224)'
const font = `${cell - 3}px 'IBM Plex Mono', ui-monospace, monospace`
const slant = Math.tan((3.5 * Math.PI) / 180)
const tilt = 0.35
const spin = 0.3
const rise = 2.6
const hold = 7
const fall = 2.2
const gap = 1.2
const cycle = rise + hold + fall + gap
const reflectionAlpha = 0.75
const solidHeight = 2.8

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
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const easeOut = (value: number) => 1 - (1 - value) ** 3
const easeIn = (value: number) => value ** 3

const subtract = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const average = (points: Vec[]): Vec =>
  [0, 1, 2].map((axis) => points.reduce((sum, point) => sum + point[axis], 0) / points.length) as Vec
const normalize = (v: Vec): Vec => {
  const length = Math.hypot(...v)
  return [v[0] / length, v[1] / length, v[2] / length]
}

const light = normalize([-0.5, 0.8, -0.6])
const view = normalize([0, -Math.sin(tilt), Math.cos(tilt)])

const solid = (vertices: Vec[], faces: number[][]): Solid => {
  const center = average(vertices)
  const normals = faces.map((face) => {
    const [a, b, c] = face.map((index) => vertices[index])
    const u = subtract(b, a)
    const w = subtract(c, a)
    const normal = normalize([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]])
    const outward = dot(normal, subtract(average(face.map((index) => vertices[index])), center)) >= 0
    return outward ? normal : ([-normal[0], -normal[1], -normal[2]] as Vec)
  })
  return { vertices, faces, normals }
}

const square = (half: number, y: number): Vec[] => [
  [-half, y, -half],
  [half, y, -half],
  [half, y, half],
  [-half, y, half],
]

const sides = (bottom: number, top: number) =>
  [0, 1, 2, 3].map((index) => [bottom + index, bottom + ((index + 1) % 4), top + ((index + 1) % 4), top + index])

const box = (width: number, height: number, depth: number) => {
  const x = width / 2
  const z = depth / 2
  const ring = (y: number): Vec[] => [
    [-x, y, -z],
    [x, y, -z],
    [x, y, z],
    [-x, y, z],
  ]
  return solid([...ring(0), ...ring(height)], [[0, 1, 2, 3], [4, 5, 6, 7], ...sides(0, 4)])
}

const pyramid = (base: number, height: number) =>
  solid(
    [...square(base / 2, 0), [0, height, 0]],
    [[0, 1, 2, 3], ...[0, 1, 2, 3].map((index) => [index, (index + 1) % 4, 4])],
  )

const obelisk = (base: number, height: number) =>
  solid(
    [...square(base / 2, 0), ...square(base * 0.31, height * 0.8), [0, height, 0]],
    [[0, 1, 2, 3], ...sides(0, 4), ...[0, 1, 2, 3].map((index) => [4 + index, 4 + ((index + 1) % 4), 8])],
  )

const crystal = (height: number, radius: number) => {
  const ring = Array.from({ length: 6 }, (_, index): Vec => {
    const angle = (index / 6) * Math.PI * 2
    return [Math.cos(angle) * radius, height * 0.4, Math.sin(angle) * radius]
  })
  return solid(
    [[0, 0, 0], ...ring, [0, height, 0]],
    ring.flatMap((_, index) => {
      const next = ((index + 1) % 6) + 1
      return [
        [0, index + 1, next],
        [index + 1, next, 7],
      ]
    }),
  )
}

const solids = [
  box(1, 2.7, 0.45),
  box(1.7, 1.7, 1.7),
  pyramid(2.1, 2),
  obelisk(1, 2.8),
  crystal(2.8, 0.85),
]

const inside = (polygon: Point2[], x: number, y: number) => {
  let sign = 0
  for (let index = 0; index < polygon.length; index += 1) {
    const [ax, ay] = polygon[index]
    const [bx, by] = polygon[(index + 1) % polygon.length]
    const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
    if (cross === 0) continue
    if (sign === 0) sign = Math.sign(cross)
    else if (Math.sign(cross) !== sign) return false
  }
  return true
}

const edgeDistance = (polygon: Point2[], x: number, y: number) => {
  let nearest = Infinity
  for (let index = 0; index < polygon.length; index += 1) {
    const [ax, ay] = polygon[index]
    const [bx, by] = polygon[(index + 1) % polygon.length]
    const dx = bx - ax
    const dy = by - ay
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1)
    nearest = Math.min(nearest, Math.hypot(x - ax - dx * t, y - ay - dy * t))
  }
  return nearest
}

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
    const scene = document.createElement('canvas')
    const sceneContext = scene.getContext('2d')
    const floor = document.createElement('canvas')
    const floorContext = floor.getContext('2d')
    const mask = document.createElement('canvas')
    const maskContext = mask.getContext('2d')
    if (!canvas || !context || !bufferContext || !sceneContext || !floorContext || !maskContext) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let ratio = 1
    let cols = 0
    let rows = 0
    let field = new Uint16Array(0)
    let visible = new Int8Array(0)
    let baseAlpha = new Float32Array(0)
    let starts = new Int16Array(0)
    let heads = new Float32Array(0)
    let speeds = new Float32Array(0)
    let horizon = 0
    let floorHeight = 0
    let floorDepth = 0
    let objectScale = 0
    let shapeIndex = 0
    let cycleStart = -1
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

    const buildMask = () => {
      maskContext.setTransform(ratio, 0, 0, ratio, 0, 0)
      maskContext.clearRect(0, 0, width, floorDepth)
      const radius = Math.min(width * 0.46, 760)
      maskContext.save()
      maskContext.translate(width / 2, 0)
      maskContext.scale(1, floorDepth / radius)
      const gradient = maskContext.createRadialGradient(0, 0, 0, 0, 0, radius)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
      gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.85)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      maskContext.fillStyle = gradient
      maskContext.fillRect(-radius, 0, radius * 2, radius)
      maskContext.restore()
    }

    const build = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      const heroHeight = canvas.parentElement?.clientHeight ?? height
      const hillRows = Math.ceil(heroHeight / cell)
      canvas.width = buffer.width = scene.width = Math.round(width * ratio)
      canvas.height = buffer.height = scene.height = Math.round(height * ratio)
      prepare(context, ratio)
      prepare(bufferContext, ratio)
      prepare(sceneContext, ratio)

      floorHeight = clamp(width * 0.1, 110, 180)
      objectScale = clamp(width * 0.12, 130, 230) / solidHeight
      horizon = heroHeight - (slant * width) / 2 - floorHeight
      floorDepth = Math.max(1, Math.min(height - horizon, floorHeight + (slant * width) / 2 + 60))
      floor.width = mask.width = Math.round(width * ratio)
      floor.height = mask.height = Math.round(floorDepth * ratio)
      floorContext.setTransform(ratio, 0, 0, ratio, 0, 0)
      buildMask()

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
          Math.max(0, Math.round(ridgeAt(ridge, (column * cell) / span) * hillRows)),
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
      sceneContext.fillText(glyphs[field[index]], column * cell + cell / 2, row * cell + cell / 2)
    }

    const drawRain = () => {
      sceneContext.fillStyle = color
      for (let offset = 1; offset < trail; offset += 1) {
        sceneContext.globalAlpha = (1 - offset / trail) * glowStrength
        for (let column = 0; column < cols; column += 1) drawGlyph(column, Math.floor(heads[column]) - offset)
      }

      sceneContext.fillStyle = headColor
      sceneContext.globalAlpha = 0.9
      for (let column = 0; column < cols; column += 1) drawGlyph(column, Math.floor(heads[column]))
      sceneContext.globalAlpha = 1
    }

    const drawObject = (time: number, animate: boolean) => {
      if (cycleStart < 0 || time - cycleStart >= cycle) {
        shapeIndex = cycleStart < 0 ? 0 : (shapeIndex + 1) % solids.length
        cycleStart = time
      }

      const elapsed = time - cycleStart
      if (elapsed >= rise + hold + fall) return

      const { vertices, faces, normals } = solids[shapeIndex]
      const angle = time * spin
      const turnCos = Math.cos(angle)
      const turnSin = Math.sin(angle)
      const turn = ([x, y, z]: Vec): Vec => [x * turnCos + z * turnSin, y, -x * turnSin + z * turnCos]
      const centerX = width / 2
      const projected = vertices.map((vertex): Point2 => {
        const [x, y, z] = turn(vertex)
        return [centerX + x * objectScale, horizon - (y * Math.cos(tilt) + z * Math.sin(tilt)) * objectScale]
      })

      const front = faces
        .map((face, index) => ({ polygon: face.map((vertex) => projected[vertex]), normal: turn(normals[index]) }))
        .filter(({ normal }) => dot(normal, view) < 0)
        .map(({ polygon, normal }) => ({ polygon, shade: 0.3 + 0.7 * Math.max(0, dot(normal, light)) }))

      const xs = projected.map(([x]) => x)
      const ys = projected.map(([, y]) => y)
      const top = Math.min(...ys)
      const bottom = Math.max(...ys)
      const travel = bottom - top + cell * 2

      let reveal = top - cell
      let forming = false
      if (elapsed < rise) {
        reveal = bottom + cell - easeOut(elapsed / rise) * travel
        forming = true
      } else if (elapsed >= rise + hold) {
        reveal = top - cell + easeIn((elapsed - rise - hold) / fall) * travel
        forming = true
      }

      const firstColumn = Math.max(0, Math.floor(Math.min(...xs) / cell))
      const lastColumn = Math.min(cols - 1, Math.floor(Math.max(...xs) / cell))
      const firstRow = Math.max(0, Math.floor(top / cell))
      const lastRow = Math.min(rows - 1, Math.floor(bottom / cell))

      for (let column = firstColumn; column <= lastColumn; column += 1) {
        const x = column * cell + cell / 2
        for (let row = firstRow; row <= lastRow; row += 1) {
          const y = row * cell + cell / 2
          const face = front.find(({ polygon }) => inside(polygon, x, y))
          if (!face) continue

          const index = column * rows + row
          if (forming && y < reveal) {
            if (animate && Math.random() < 0.08) {
              sceneContext.clearRect(column * cell, row * cell, cell, cell)
              sceneContext.fillStyle = objectColor
              sceneContext.globalAlpha = 0.2 + Math.random() * 0.4
              sceneContext.fillText(glyphs[field[index]], x, y)
            }
            continue
          }
          if (!forming && y < reveal) continue

          const edge = edgeDistance(face.polygon, x, y) < cell * 0.55
          const hot = forming && y - reveal < cell
          sceneContext.clearRect(column * cell, row * cell, cell, cell)
          sceneContext.fillStyle = hot ? objectHotColor : edge ? objectEdgeColor : objectColor
          sceneContext.globalAlpha = hot || edge ? 1 : 0.2 + face.shade * 0.8
          sceneContext.fillText(glyphs[field[index]], x, y)
          if (animate && Math.random() < 0.03) mutate(index)
        }
      }
      sceneContext.globalAlpha = 1
    }

    const drawReflection = () => {
      floorContext.globalCompositeOperation = 'source-over'
      floorContext.clearRect(0, 0, width, floorDepth)
      const step = 2
      for (let offset = 0; offset < floorDepth; offset += step) {
        const depth = Math.min(1, offset / floorHeight)
        const source = horizon - offset * (0.85 - 0.25 * depth)
        const sourceHeight = step * (0.85 - 0.5 * depth)
        if (source - sourceHeight < 0) break
        const sourceWidth = width / (1 + 0.45 * depth)
        floorContext.drawImage(
          scene,
          (width / 2 - sourceWidth / 2) * ratio,
          (source - sourceHeight) * ratio,
          sourceWidth * ratio,
          sourceHeight * ratio,
          0,
          offset,
          width,
          step,
        )
      }
      floorContext.globalCompositeOperation = 'destination-in'
      floorContext.drawImage(mask, 0, 0, width, floorDepth)
      floorContext.globalCompositeOperation = 'source-over'
    }

    const render = (time: number, animate: boolean) => {
      sceneContext.clearRect(0, 0, width, height)
      sceneContext.drawImage(buffer, 0, 0, width, height)
      if (animate) drawRain()
      drawObject(time, animate)
      drawReflection()

      context.clearRect(0, 0, width, height)
      context.drawImage(scene, 0, 0, width, height)
      context.globalCompositeOperation = 'destination-out'
      context.drawImage(mask, 0, horizon, width, floorDepth)
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = reflectionAlpha
      context.drawImage(floor, 0, horizon, width, floorDepth)
      context.globalAlpha = 1
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
      render(time / 1000, true)
    }

    const start = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(loop)
    }

    const stop = () => cancelAnimationFrame(frame)

    const resizeObserver = new ResizeObserver(() => {
      build()
      if (reduced) {
        shapeIndex = 0
        cycleStart = 0
        render(rise + hold / 2, false)
      } else {
        render(performance.now() / 1000, true)
      }
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
