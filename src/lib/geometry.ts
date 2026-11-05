import type { Part, FlexWire } from '../types'
import { COMPONENT_MAP, COMPONENT_TERMINALS } from './components-data.js'

export const SNAP_RADIUS = 18
export const RING_RADIUS = 9

export interface Point {
  x: number
  y: number
}

export interface NearTerminal extends Point {
  partId: string
  term: string
}

export function terminalPosition(part: Part, label: string): Point {
  const def = COMPONENT_MAP[part.type]
  const terminals = COMPONENT_TERMINALS[part.type] || []
  const terminal = terminals.filter(item => item.label === label)[0]
  if (!terminal) return { x: part.x, y: part.y }

  const localX = terminal.x * def.width
  const localY = terminal.y * def.height

  const angle = ((part.rotation || 0) * Math.PI) / 180
  const centerX = def.width / 2
  const centerY = def.height / 2
  const dx = localX - centerX
  const dy = localY - centerY
  const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle)
  const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle)

  return { x: part.x + centerX + rotatedX, y: part.y + centerY + rotatedY }
}

export function flexWirePoints(fw: FlexWire): { red: string; blue: string } {
  const dx = fw.bx - fw.ax
  const dy = fw.by - fw.ay
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const normalX = -dy / length
  const normalY = dx / length
  const amplitude = Math.min(6, length / 8)
  const steps = Math.max(2, Math.round(length / 10))

  const red: string[] = []
  const blue: string[] = []
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    const px = fw.ax + dx * fraction
    const py = fw.ay + dy * fraction
    const offset = amplitude * Math.sin(fraction * Math.PI * 3)
    red.push((px + normalX * offset).toFixed(1) + ',' + (py + normalY * offset).toFixed(1))
    blue.push((px - normalX * offset).toFixed(1) + ',' + (py - normalY * offset).toFixed(1))
  }

  return { red: red.join(' '), blue: blue.join(' ') }
}

export function findNearestTerminal(
  parts: Part[],
  flexWires: FlexWire[],
  x: number,
  y: number,
  fwId: string,
  end: 'A' | 'B'
): NearTerminal | null {
  let best: NearTerminal | null = null
  let bestDistance = SNAP_RADIUS

  const wire = flexWires.filter(item => item.id === fwId)[0]
  const ownSnap = wire ? (end === 'A' ? wire.snapA : wire.snapB) : null

  parts.forEach(part => {
    const terminals = COMPONENT_TERMINALS[part.type] || []
    terminals.forEach(terminal => {
      if (ownSnap && ownSnap.partId === part.id && ownSnap.term === terminal.label) return

      const position = terminalPosition(part, terminal.label)
      const dx = position.x - x
      const dy = position.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < bestDistance) {
        bestDistance = distance
        best = { partId: part.id, term: terminal.label, x: position.x, y: position.y }
      }
    })
  })

  return best
}
