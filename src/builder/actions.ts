import type { Part, FlexWire, SchemeData } from '../types'
import { COMPONENT_MAP } from '../lib/components-data.js'
import { terminalPosition } from '../lib/geometry.js'
import { state, els, newPartId, newWireId, findPart, findFlexWire } from './state.js'
import { renderAll, renderPropsPanel, updateSelectionHighlight } from './render.js'

export function syncSnappedRingPositions() {
  state.flexWires.forEach(fw => {
    if (fw.snapA) {
      const part = findPart(fw.snapA.partId)
      if (part) {
        const position = terminalPosition(part, fw.snapA.term)
        fw.ax = position.x
        fw.ay = position.y
      }
    }
    if (fw.snapB) {
      const part = findPart(fw.snapB.partId)
      if (part) {
        const position = terminalPosition(part, fw.snapB.term)
        fw.bx = position.x
        fw.by = position.y
      }
    }
  })
}

function placeFlexWire(x: number, y: number) {
  const half = 50
  const wire: FlexWire = {
    id: newWireId('fw'),
    ax: x - half,
    ay: y,
    bx: x + half,
    by: y,
    snapA: null,
    snapB: null
  }
  state.flexWires.push(wire)
  renderAll()
}

export function placePart(type: string, x: number, y: number) {
  const def = COMPONENT_MAP[type]
  if (!def) return

  if (type === 'wire') {
    placeFlexWire(x, y)
    return
  }

  const part: Part = {
    id: newPartId(),
    type,
    x,
    y,
    rotation: 0,
    state: {}
  }

  if (type === 'switch') part.state.closed = false
  if (type === 'button') part.state.pressed = false
  if (type === 'rheostat') part.state.value = def.resistanceOhm
  if (type === 'fuse') part.state.blown = false
  if (type === 'battery') part.state.voltage = def.emfV
  if (type === 'resistor') part.state.resistanceOhm = def.resistanceOhm

  state.parts.push(part)
  renderAll()
}

export function removePart(partId: string) {
  state.parts = state.parts.filter(part => part.id !== partId)
  state.wires = state.wires.filter(wire => wire.fromPart !== partId && wire.toPart !== partId)
  state.flexWires.forEach(fw => {
    if (fw.snapA && fw.snapA.partId === partId) fw.snapA = null
    if (fw.snapB && fw.snapB.partId === partId) fw.snapB = null
  })
  if (state.selectedPartId === partId) state.selectedPartId = null
  renderAll()
}

export function removeFlexWire(fwId: string) {
  state.flexWires = state.flexWires.filter(wire => wire.id !== fwId)
  if (state.selectedFlexWireId === fwId) state.selectedFlexWireId = null
  renderAll()
}

export function removeWire(wireId: string) {
  state.wires = state.wires.filter(wire => wire.id !== wireId)
  renderAll()
}

export function addWire(fromPart: string, fromTerm: string, toPart: string, toTerm: string) {
  const exists = state.wires.some(wire => {
    const same = wire.fromPart === fromPart && wire.fromTerm === fromTerm && wire.toPart === toPart && wire.toTerm === toTerm
    const reverse = wire.fromPart === toPart && wire.fromTerm === toTerm && wire.toPart === fromPart && wire.toTerm === fromTerm
    return same || reverse
  })
  if (exists) return

  state.wires.push({
    id: newWireId('w'),
    fromPart,
    fromTerm,
    toPart,
    toTerm
  })
}

export function detachRing(fwId: string, end: 'A' | 'B') {
  const fw = findFlexWire(fwId)
  if (!fw) return

  const snap = end === 'A' ? fw.snapA : fw.snapB
  if (!snap) return

  const otherX = end === 'A' ? fw.bx : fw.ax
  const otherY = end === 'A' ? fw.by : fw.ay
  const thisX = end === 'A' ? fw.ax : fw.bx
  const thisY = end === 'A' ? fw.ay : fw.by

  const dx = thisX - otherX
  const dy = thisY - otherY
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const nudge = 16
  const newX = thisX + (dx / length) * nudge
  const newY = thisY + (dy / length) * nudge

  if (end === 'A') {
    fw.ax = newX
    fw.ay = newY
    fw.snapA = null
  } else {
    fw.bx = newX
    fw.by = newY
    fw.snapB = null
  }

  renderAll()
}

export function rotatePart(partId: string) {
  const part = findPart(partId)
  if (!part) return
  part.rotation = ((part.rotation || 0) + 90) % 360
  syncSnappedRingPositions()
  renderAll()
}

export function selectPart(partId: string) {
  state.selectedPartId = partId
  state.selectedFlexWireId = null
  updateSelectionHighlight()
  renderPropsPanel()
}

export function selectFlexWire(fwId: string) {
  state.selectedFlexWireId = fwId
  state.selectedPartId = null
  updateSelectionHighlight()
  renderPropsPanel()
}

export function clearSelection() {
  state.selectedPartId = null
  state.selectedFlexWireId = null
  updateSelectionHighlight()
  renderPropsPanel()
}

export function clearCanvas() {
  state.parts = []
  state.wires = []
  state.flexWires = []
  state.selectedPartId = null
  state.selectedFlexWireId = null
  state.currentSchemeId = null
  state.currentSchemeTitle = ''
  renderAll()
}

export function serializeScheme(): SchemeData {
  return {
    parts: state.parts.map(part => ({
      id: part.id,
      type: part.type,
      x: part.x,
      y: part.y,
      rotation: part.rotation,
      state: part.state
    })),
    wires: state.wires.map(wire => ({
      id: wire.id,
      fromPart: wire.fromPart,
      fromTerm: wire.fromTerm,
      toPart: wire.toPart,
      toTerm: wire.toTerm
    })),
    flexWires: state.flexWires.map(fw => ({
      id: fw.id,
      ax: fw.ax,
      ay: fw.ay,
      bx: fw.bx,
      by: fw.by,
      snapA: fw.snapA ? { partId: fw.snapA.partId, term: fw.snapA.term } : null,
      snapB: fw.snapB ? { partId: fw.snapB.partId, term: fw.snapB.term } : null
    }))
  }
}

function biggestNumber(ids: string[]): number {
  let biggest = 0
  ids.forEach(id => {
    const number = parseInt(String(id).replace(/[^\d]/g, ''), 10)
    if (!isNaN(number) && number > biggest) biggest = number
  })
  return biggest
}

export function loadSchemeData(data: SchemeData) {
  state.parts = (data.parts || [])
    .filter(part => COMPONENT_MAP[part.type])
    .map(part => ({
      id: part.id,
      type: part.type,
      x: part.x,
      y: part.y,
      rotation: part.rotation || 0,
      state: part.state || {}
    }))

  state.wires = (data.wires || []).map(wire => ({
    id: wire.id,
    fromPart: wire.fromPart,
    fromTerm: wire.fromTerm,
    toPart: wire.toPart,
    toTerm: wire.toTerm
  }))

  state.flexWires = (data.flexWires || []).map(fw => ({
    id: fw.id,
    ax: fw.ax,
    ay: fw.ay,
    bx: fw.bx,
    by: fw.by,
    snapA: fw.snapA ? { partId: fw.snapA.partId, term: fw.snapA.term } : null,
    snapB: fw.snapB ? { partId: fw.snapB.partId, term: fw.snapB.term } : null
  }))

  syncSnappedRingPositions()

  const wireIds = state.wires.map(wire => wire.id).concat(state.flexWires.map(fw => fw.id))
  state.nextPartSeq = biggestNumber(state.parts.map(part => part.id)) + 1
  state.nextWireSeq = biggestNumber(wireIds) + 1
  state.selectedPartId = null
  state.selectedFlexWireId = null

  renderAll()
}

export function canvasPoint(clientX: number, clientY: number) {
  const rect = els.canvasInner.getBoundingClientRect()
  return {
    x: Math.max(0, clientX - rect.left),
    y: Math.max(0, clientY - rect.top)
  }
}
