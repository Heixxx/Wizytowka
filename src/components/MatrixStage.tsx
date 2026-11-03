import { useEffect, useRef } from 'react'

type Vec = [x: number, y: number, z: number]
type Point = [x: number, y: number, z: number, weight: number]
type Rgb = [r: number, g: number, b: number]

interface Shape {
  name: string
  points: Point[]
  height: number
}

interface Particle {
  x: number
  y: number
  z: number
  speed: number
  life: number
  decay: number
  glyph: number
}

const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789<>{}[]/=+*#$%'
const fps = 30
const font = (size: number) => `${size}px 'IBM Plex Mono', ui-monospace, monospace`
const floorHalf = 4.5
const floorNear = -4
const floorFar = 6
const floorStep = 0.5
const cameraHeight = 4.2
const cameraDistance = 8
const pitch = 0.42
const spin = 0.35
const rise = 2.4
const hold = 7
const fall = 2
const gap = 1
const cycle = rise + hold + fall + gap
const pulseEvery = 3.6
const pulseLength = 2.6
const maxParticles = 240
const blue: Rgb = [74, 123, 255]
const red: Rgb = [255, 52, 72]
const hot = 'rgb(255, 220, 220)'
const blueColor = 'rgb(74, 123, 255)'
const redColor = 'rgb(255, 52, 72)'

const randomGlyph = () => Math.floor(Math.random() * glyphs.length)
const mix = (from: Rgb, to: Rgb, amount: number) =>
  `rgb(${from.map((value, index) => Math.round(value + (to[index] - value) * amount)).join(', ')})`
const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`
const easeOut = (value: number) => 1 - (1 - value) ** 3
const easeIn = (value: number) => value ** 3

const line = (points: Point[], from: Vec, to: Vec, weight = 1, step = 0.2) => {
  const count = Math.max(1, Math.round(Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]) / step))
  for (let index = 0; index < count; index += 1) {
    const t = index / count
    points.push([
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t,
      weight,
    ])
  }
}

const box = (width: number, height: number, depth: number) => {
  const x = width / 2
  const z = depth / 2
  const corners: Vec[] = [
    [-x, 0, -z],
    [x, 0, -z],
    [x, 0, z],
    [-x, 0, z],
    [-x, height, -z],
    [x, height, -z],
    [x, height, z],
    [-x, height, z],
  ]
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
  const points: Point[] = []
  edges.forEach(([from, to]) => line(points, corners[from], corners[to]))

  const step = 0.42
  for (let y = step; y < height - 0.1; y += step) {
    for (let u = -x + step / 2; u < x; u += step) points.push([u, y, -z, 0.4], [u, y, z, 0.4])
    for (let u = -z + step / 2; u < z; u += step) points.push([-x, y, u, 0.4], [x, y, u, 0.4])
  }
  return points
}

const pyramid = (base: number, height: number) => {
  const half = base / 2
  const corners: Vec[] = [
    [-half, 0, -half],
    [half, 0, -half],
    [half, 0, half],
    [-half, 0, half],
  ]
  const apex: Vec = [0, height, 0]
  const points: Point[] = [[...apex, 1]]
  corners.forEach((corner, index) => {
    line(points, corner, corners[(index + 1) % 4])
    line(points, corner, apex)
  })

  for (let y = 0.4; y < height - 0.3; y += 0.4) {
    const scale = 1 - y / height
    const ring = corners.map(([x, , z]): Vec => [x * scale, y, z * scale])
    ring.forEach((corner, index) => line(points, corner, ring[(index + 1) % 4], 0.4, 0.3))
  }
  return points
}

const crystal = (height: number, radius: number) => {
  const top: Vec = [0, height, 0]
  const bottom: Vec = [0, 0, 0]
  const ring = Array.from({ length: 6 }, (_, index): Vec => {
    const angle = (index / 6) * Math.PI * 2
    return [Math.cos(angle) * radius, height * 0.4, Math.sin(angle) * radius]
  })
  const points: Point[] = [[...top, 1]]
  ring.forEach((corner, index) => {
    line(points, corner, ring[(index + 1) % 6])
    line(points, bottom, corner)
    line(points, corner, top)
  })
  return points
}

const portal = (radius: number) => {
  const center = radius + 0.1
  const count = Math.round((Math.PI * 2 * radius) / 0.2)
  const points: Point[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius
    points.push([x, y, -0.14, 1], [x, y, 0.14, 1])
    if (index % 2 === 0) points.push([x * 0.78, center + Math.sin(angle) * radius * 0.78, 0, 0.4])
  }
  line(points, [-0.8, 0, 0], [0.8, 0, 0])
  return points
}

const shapes: Shape[] = [
  { name: 'MONOLITH', points: box(1.05, 2.7, 0.5) },
  { name: 'CUBE', points: box(1.7, 1.7, 1.7) },
  { name: 'PYRAMID', points: pyramid(2.1, 2.1) },
  { name: 'PORTAL', points: portal(1.25) },
  { name: 'CRYSTAL', points: crystal(2.8, 0.85) },
].map((shape) => ({ ...shape, height: Math.max(...shape.points.map((point) => point[1])) }))

export default function MatrixStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cos = Math.cos(pitch)
    const sin = Math.sin(pitch)
    const columns = Math.round((floorHalf * 2) / floorStep) + 1
    const rows = Math.round((floorFar - floorNear) / floorStep) + 1
    const floor = Uint16Array.from({ length: columns * rows }, randomGlyph)
    const particles: Particle[] = []
    let objectGlyphs = new Uint16Array(0)
    let shapeIndex = 0
    let cycleStart = -1
    let width = 0
    let height = 0
    let scale = 0
    let centerX = 0
    let centerY = 0
    let frame = 0
    let last = 0

    const project = (x: number, y: number, z: number) => {
      const up = y - cameraHeight
      const forward = z + cameraDistance
      const depth = -up * sin + forward * cos
      return [
        centerX + (scale * x) / depth,
        centerY - (scale * (up * cos + forward * sin)) / depth,
        scale / depth,
      ] as const
    }

    const build = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      scale = 1
      centerX = 0
      centerY = 0
      const bounds: Vec[] = Array.from({ length: 24 }, (_, index): Vec => {
        const angle = (index / 24) * Math.PI * 2
        return [Math.cos(angle) * floorHalf * 0.85, 0, 1 + Math.sin(angle) * 4.2]
      })
      bounds.push([-1.5, 3.4, -1.5], [1.5, 3.4, -1.5])
      const projected = bounds.map(([x, y, z]) => project(x, y, z))
      const xs = projected.map(([x]) => x)
      const ys = projected.map(([, y]) => y)
      const margin = 8
      scale = Math.min(
        (width - margin * 2) / (Math.max(...xs) - Math.min(...xs)),
        (height - margin * 2) / (Math.max(...ys) - Math.min(...ys)),
      )
      centerX = width / 2
      centerY = height - margin - scale * Math.max(...ys)
    }

    const startShape = (index: number, time: number) => {
      shapeIndex = index
      cycleStart = time
      objectGlyphs = Uint16Array.from({ length: shapes[index].points.length }, randomGlyph)
    }

    const drawFloor = (pulse: number, heat: number) => {
      const glow = mix(blue, red, heat)
      const [baseX, baseY] = project(0, 0, 1)
      const [edgeX] = project(floorHalf, 0, 1)
      const gradient = context.createRadialGradient(baseX, baseY, 0, baseX, baseY, edgeX - baseX)
      gradient.addColorStop(0, rgba(blue, 0.32))
      gradient.addColorStop(1, rgba(blue, 0))

      context.lineWidth = 1
      context.strokeStyle = gradient
      context.beginPath()
      for (let column = 0; column < columns; column += 1) {
        const x = -floorHalf + column * floorStep
        const [nearX, nearY] = project(x, 0, floorNear)
        const [farX, farY] = project(x, 0, floorFar)
        context.moveTo(nearX, nearY)
        context.lineTo(farX, farY)
      }
      for (let row = 0; row < rows; row += 1) {
        const z = floorNear + row * floorStep
        const [leftX, leftY] = project(-floorHalf, 0, z)
        const [rightX, rightY] = project(floorHalf, 0, z)
        context.moveTo(leftX, leftY)
        context.lineTo(rightX, rightY)
      }
      context.stroke()

      const bright: number[] = []
      context.fillStyle = blueColor
      for (let row = 0; row < rows; row += 1) {
        const z = floorNear + row * floorStep
        const [, , unit] = project(0, 0, z)
        context.font = font(Math.min(22, Math.max(6, Math.round(unit * 0.22))))

        for (let column = 0; column < columns; column += 1) {
          const x = -floorHalf + column * floorStep
          const fade = Math.max(0, 1 - Math.hypot(x / floorHalf, (z - 1) / 5)) ** 1.5
          if (fade === 0) continue

          const distance = Math.hypot(x, z)
          const boost = pulse < 0 ? 0 : Math.max(0, 1 - Math.abs(distance - pulse) / 0.45) * (1 - pulse / 6)
          const index = row * columns + column
          if (boost > 0.3) {
            bright.push(index, boost * fade)
            continue
          }

          const [px, py] = project(x, 0, z)
          context.globalAlpha = 0.06 + fade * 0.3
          context.fillText(glyphs[floor[index]], px, py)
        }
      }

      context.fillStyle = glow
      for (let item = 0; item < bright.length; item += 2) {
        const index = bright[item]
        const row = Math.floor(index / columns)
        const column = index - row * columns
        const z = floorNear + row * floorStep
        const [px, py, unit] = project(-floorHalf + column * floorStep, 0, z)
        context.font = font(Math.min(22, Math.max(6, Math.round(unit * 0.22))))
        context.globalAlpha = Math.min(1, 0.3 + bright[item + 1])
        context.fillText(glyphs[floor[index]], px, py)
      }
      context.globalAlpha = 1
    }

    const drawGlow = (heat: number, presence: number) => {
      const [baseX, baseY] = project(0, 0, 0)
      const [edgeX] = project(1.9, 0, 0)
      const radius = edgeX - baseX
      context.save()
      context.translate(baseX, baseY)
      context.scale(1, 0.3)
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius)
      const color: Rgb = heat > 0.5 ? red : blue
      gradient.addColorStop(0, rgba(color, 0.38 * presence))
      gradient.addColorStop(1, rgba(color, 0))
      context.fillStyle = gradient
      context.fillRect(-radius, -radius, radius * 2, radius * 2)
      context.restore()
    }

    const drawObject = (shape: Shape, angle: number, level: number, heat: number, forming: boolean) => {
      const turnCos = Math.cos(angle)
      const turnSin = Math.sin(angle)
      const [, , unit] = project(0, 0, 0)
      const heads: number[] = []

      context.font = font(Math.min(20, Math.max(9, Math.round(unit * 0.3))))
      context.fillStyle = mix(blue, red, heat)
      shape.points.forEach(([x, y, z, weight], index) => {
        if (y > level) return
        const turnedX = x * turnCos + z * turnSin
        const turnedZ = -x * turnSin + z * turnCos
        if (forming && level - y < 0.3) {
          heads.push(index)
          return
        }
        const [px, py] = project(turnedX, y, turnedZ)
        const shade = 0.55 + 0.45 * Math.min(1, Math.max(0, (1.2 - turnedZ) / 2.4))
        context.globalAlpha = weight * shade * (0.8 + Math.random() * 0.2)
        context.fillText(glyphs[objectGlyphs[index]], px, py)
      })

      context.fillStyle = hot
      context.globalAlpha = 1
      heads.forEach((index) => {
        const [x, y, z] = shape.points[index]
        const [px, py] = project(x * turnCos + z * turnSin, y, -x * turnSin + z * turnCos)
        context.fillText(glyphs[objectGlyphs[index]], px, py)
      })
    }

    const drawParticles = () => {
      context.fillStyle = redColor
      particles.forEach((particle) => {
        const [px, py, unit] = project(particle.x, particle.y, particle.z)
        context.font = font(Math.min(16, Math.max(7, Math.round(unit * 0.2))))
        context.globalAlpha = particle.life * 0.85
        context.fillText(glyphs[particle.glyph], px, py)
      })
      context.globalAlpha = 1
    }

    const drawLabel = (shape: Shape, elapsed: number) => {
      const characters = Math.floor(elapsed * 30)
      if (characters <= 0) return
      const integrity = Math.min(100, Math.round((elapsed / 1.4) * 100))
      const title = `OBJ_${String(shapeIndex + 1).padStart(2, '0')} // ${shape.name}`.slice(0, characters)
      const status = `INTEGRITY ${String(integrity).padStart(3, '0')}%`.slice(0, Math.max(0, characters - 12))
      const [anchorX, anchorY] = project(0.9, shape.height * 0.85, 0)
      const labelX = Math.min(width - 150, anchorX + 46)
      const labelY = anchorY - 22

      context.globalAlpha = 0.75
      context.strokeStyle = blueColor
      context.beginPath()
      context.moveTo(anchorX, anchorY)
      context.lineTo(labelX - 6, labelY + 6)
      context.lineTo(labelX + 120, labelY + 6)
      context.stroke()

      context.fillStyle = blueColor
      context.font = font(11)
      context.textAlign = 'left'
      context.fillText(title, labelX, labelY - 4)
      context.fillText(status, labelX, labelY + 18)
      context.textAlign = 'center'
      context.globalAlpha = 1
    }

    const frameAt = (time: number, animate: boolean) => {
      if (cycleStart < 0 || time - cycleStart >= cycle) {
        startShape(cycleStart < 0 ? 0 : (shapeIndex + 1) % shapes.length, time)
      }

      const shape = shapes[shapeIndex]
      const top = shape.height + 0.5
      const elapsed = time - cycleStart
      let level = -1
      let heat = 1
      let forming = false
      let spawn = 0

      if (elapsed < rise) {
        level = easeOut(elapsed / rise) * top
        forming = true
        spawn = 4
      } else if (elapsed < rise + hold) {
        level = top
        heat = 1 - Math.min(1, (elapsed - rise) / 1.6)
        spawn = 0.25
      } else if (elapsed < rise + hold + fall) {
        const progress = (elapsed - rise - hold) / fall
        level = top * (1 - easeIn(progress)) - 0.3
        heat = Math.min(1, progress * 3)
        forming = true
        spawn = 4
      }

      if (animate) {
        for (let count = spawn; count > 0; count -= 1) {
          if (particles.length >= maxParticles || (count < 1 && Math.random() > count)) break
          const angle = Math.random() * Math.PI * 2
          const radius = Math.sqrt(Math.random()) * 1.4
          particles.push({
            x: Math.cos(angle) * radius,
            y: 0,
            z: Math.sin(angle) * radius,
            speed: 0.03 + Math.random() * 0.06,
            life: 1,
            decay: 0.012 + Math.random() * 0.014,
            glyph: randomGlyph(),
          })
        }

        for (let index = particles.length - 1; index >= 0; index -= 1) {
          const particle = particles[index]
          particle.y += particle.speed
          particle.life -= particle.decay
          if (Math.random() < 0.08) particle.glyph = randomGlyph()
          if (particle.life <= 0) particles.splice(index, 1)
        }

        for (let count = 0; count < 8; count += 1) floor[Math.floor(Math.random() * floor.length)] = randomGlyph()
        for (let count = 0; count < 4; count += 1) {
          objectGlyphs[Math.floor(Math.random() * objectGlyphs.length)] = randomGlyph()
        }
      }

      const pulseTime = time % pulseEvery
      const pulse = animate && pulseTime < pulseLength ? (pulseTime / pulseLength) * 6 : -1

      context.clearRect(0, 0, width, height)
      drawGlow(heat, level < 0 ? 0.2 : Math.min(1, level / top + 0.2))
      drawFloor(pulse, forming ? 1 : heat)
      if (level > 0) drawObject(shape, time * spin, level, heat, forming)
      drawParticles()
      if (!forming && level > 0) drawLabel(shape, elapsed - rise - 0.6)
    }

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (time - last < 1000 / fps) return
      last = time
      frameAt(time / 1000, true)
    }

    const start = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(loop)
    }

    const stop = () => cancelAnimationFrame(frame)

    const resizeObserver = new ResizeObserver(() => {
      build()
      if (reduced) {
        startShape(0, 0)
        frameAt(rise + hold / 2, false)
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

  return <canvas className="hero__stage" ref={canvasRef} aria-hidden="true" />
}
