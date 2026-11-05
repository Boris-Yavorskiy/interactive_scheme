import { COMPONENT_MAP } from '../lib/components-data.js'
import { prepareAudio } from '../lib/audio.js'
import { SNAP_RADIUS, terminalPosition, findNearestTerminal } from '../lib/geometry.js'
import { state, els, t, findPart, findFlexWire } from './state.js'
import {
  renderAll,
  renderWires,
  runSimulation,
  updateFlexWireBody,
  updateButtonVisual
} from './render.js'
import {
  placePart,
  removePart,
  removeFlexWire,
  removeWire,
  addWire,
  detachRing,
  rotatePart,
  selectPart,
  selectFlexWire,
  clearSelection,
  clearCanvas,
  canvasPoint,
  syncSnappedRingPositions
} from './actions.js'
import { saveCurrentScheme } from './modals.js'

const DRAG_THRESHOLD = 5
const DOUBLE_CLICK_MS = 380
const DETACH_RADIUS = SNAP_RADIUS * 2.2

let audioReady = false

function startPartDrag(partId: string, grabX: number, grabY: number) {
  const part = findPart(partId)
  if (!part) return
  const rect = els.canvasInner.getBoundingClientRect()
  state.partDrag = {
    partId,
    offsetX: grabX - rect.left - part.x,
    offsetY: grabY - rect.top - part.y,
    rect
  }
  document.body.classList.add('sb-dragging')
}

function startWireDraft(partId: string, term: string, event: MouseEvent) {
  const rect = els.canvasInner.getBoundingClientRect()
  state.wireDraft = {
    fromPart: partId,
    fromTerm: term,
    curX: event.clientX - rect.left,
    curY: event.clientY - rect.top,
    rect
  }
  document.body.classList.add('sb-dragging')
}

function startRingDrag(fwId: string, end: 'A' | 'B') {
  const rect = els.canvasInner.getBoundingClientRect()
  state.ringDrag = { fwId, end, rect }
  document.body.classList.add('sb-dragging')
}

function pressPart(partId: string, event: MouseEvent) {
  const part = findPart(partId)
  if (!part) return

  selectPart(partId)
  state.pendingPress = {
    partId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  }

  if (part.type === 'button') {
    part.state.pressed = true
    runSimulation()
    updateButtonVisual(partId, true)
  }
}

function pressRing(fwId: string, end: 'A' | 'B') {
  const key = fwId + ':' + end
  const now = Date.now()
  const last = state.lastRingClick

  if (last && last.key === key && now - last.time < DOUBLE_CLICK_MS) {
    state.lastRingClick = null
    detachRing(fwId, end)
    return
  }

  state.lastRingClick = { key, time: now }
  selectFlexWire(fwId)
  startRingDrag(fwId, end)
}

function onCanvasMouseDown(event: MouseEvent) {
  if (event.button !== 0) return
  event.preventDefault()

  if (!audioReady) {
    audioReady = true
    prepareAudio()
  }

  const target = event.target as Element

  const terminal = target.closest<HTMLElement>('.sb-terminal')
  if (terminal) {
    startWireDraft(terminal.dataset.partId || '', terminal.dataset.termLabel || '', event)
    return
  }

  const ring = target.closest('.sb-flexwire-ring')
  if (ring) {
    const end = ring.getAttribute('data-end') === 'B' ? 'B' : 'A'
    pressRing(ring.getAttribute('data-fw-id') || '', end)
    return
  }

  const partBox = target.closest<HTMLElement>('.sb-part')
  if (partBox) {
    pressPart(partBox.dataset.partId || '', event)
    return
  }

  if (target === els.canvasInner) clearSelection()
}

function onWireLayerClick(event: MouseEvent) {
  const target = event.target as Element

  const line = target.closest('.sb-wire-line')
  if (line) {
    const wireId = line.getAttribute('data-wire-id') || ''
    const now = Date.now()
    const last = state.lastWireClick
    if (last && last.id === wireId && now - last.time < DOUBLE_CLICK_MS) {
      state.lastWireClick = null
      removeWire(wireId)
    } else {
      state.lastWireClick = { id: wireId, time: now }
    }
    return
  }

  const body = target.closest('.sb-flexwire-body')
  if (body) {
    selectFlexWire(body.getAttribute('data-fw-id') || '')
  }
}

function dragRing(event: MouseEvent) {
  const drag = state.ringDrag
  if (!drag) return
  const fw = findFlexWire(drag.fwId)
  if (!fw) return

  const x = event.clientX - drag.rect.left
  const y = event.clientY - drag.rect.top
  const end = drag.end
  let snapChanged = false

  const currentSnap = end === 'A' ? fw.snapA : fw.snapB
  if (currentSnap) {
    const snapPart = findPart(currentSnap.partId)
    if (snapPart) {
      const snapPosition = terminalPosition(snapPart, currentSnap.term)
      const dx = x - snapPosition.x
      const dy = y - snapPosition.y
      if (Math.sqrt(dx * dx + dy * dy) <= DETACH_RADIUS) {
        if (end === 'A') {
          fw.ax = snapPosition.x
          fw.ay = snapPosition.y
        } else {
          fw.bx = snapPosition.x
          fw.by = snapPosition.y
        }
        updateFlexWireBody(fw)
        return
      }
      if (end === 'A') {
        fw.snapA = null
        fw.ax = x
        fw.ay = y
      } else {
        fw.snapB = null
        fw.bx = x
        fw.by = y
      }
      snapChanged = true
    }
  }

  const candidate = findNearestTerminal(state.parts, state.flexWires, x, y, fw.id, end)
  const previousSnap = end === 'A' ? fw.snapA : fw.snapB

  if (candidate) {
    const snap = { partId: candidate.partId, term: candidate.term }
    if (end === 'A') {
      fw.ax = candidate.x
      fw.ay = candidate.y
      fw.snapA = snap
    } else {
      fw.bx = candidate.x
      fw.by = candidate.y
      fw.snapB = snap
    }
    if (!previousSnap || previousSnap.partId !== candidate.partId) snapChanged = true
  } else {
    if (previousSnap) snapChanged = true
    if (end === 'A') {
      fw.ax = x
      fw.ay = y
      fw.snapA = null
    } else {
      fw.bx = x
      fw.by = y
      fw.snapB = null
    }
  }

  if (snapChanged) renderWires()
  else updateFlexWireBody(fw)
}

function dragPart(event: MouseEvent) {
  const drag = state.partDrag
  if (!drag) return
  const part = findPart(drag.partId)
  if (!part) return

  part.x = Math.max(0, event.clientX - drag.rect.left - drag.offsetX)
  part.y = Math.max(0, event.clientY - drag.rect.top - drag.offsetY)

  const box = els.partsLayer.querySelector<HTMLElement>('.sb-part[data-part-id="' + part.id + '"]')
  if (box) {
    box.style.left = part.x + 'px'
    box.style.top = part.y + 'px'
  }

  syncSnappedRingPositions()
  state.flexWires.forEach(fw => {
    const onA = fw.snapA && fw.snapA.partId === part.id
    const onB = fw.snapB && fw.snapB.partId === part.id
    if (onA || onB) updateFlexWireBody(fw)
  })
}

function onMouseMove(event: MouseEvent) {
  const press = state.pendingPress
  if (press && !state.partDrag) {
    const farX = Math.abs(event.clientX - press.startX) > DRAG_THRESHOLD
    const farY = Math.abs(event.clientY - press.startY) > DRAG_THRESHOLD
    if (farX || farY) {
      press.moved = true
      startPartDrag(press.partId, press.startX, press.startY)
    }
  }

  if (state.partDrag || state.ringDrag || state.wireDraft) {
    const selection = window.getSelection()
    if (selection) selection.removeAllRanges()
  }

  if (state.partDrag) dragPart(event)

  if (state.wireDraft) {
    state.wireDraft.curX = event.clientX - state.wireDraft.rect.left
    state.wireDraft.curY = event.clientY - state.wireDraft.rect.top
    renderWires()
  }

  if (state.ringDrag) dragRing(event)
}

function onMouseUp(event: MouseEvent) {
  document.body.classList.remove('sb-dragging')
  let needRender = false

  const press = state.pendingPress
  state.pendingPress = null
  if (press) {
    const part = findPart(press.partId)
    if (part && part.type === 'switch' && !press.moved) {
      part.state.closed = !part.state.closed
      needRender = true
    }
    if (part && part.type === 'button') {
      part.state.pressed = false
      needRender = true
    }
  }

  if (state.partDrag) {
    state.partDrag = null
    needRender = true
  }

  if (state.ringDrag) {
    state.ringDrag = null
    needRender = true
  }

  if (state.wireDraft) {
    const draft = state.wireDraft
    state.wireDraft = null
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
    if (target && target.classList.contains('sb-terminal')) {
      const toPart = target.dataset.partId || ''
      const toTerm = target.dataset.termLabel || ''
      if (toPart !== draft.fromPart || toTerm !== draft.fromTerm) {
        addWire(draft.fromPart, draft.fromTerm, toPart, toTerm)
        needRender = true
      }
    }
    if (!needRender) renderWires()
  }

  if (needRender) renderAll()
}

function refreshDragRects() {
  const rect = els.canvasInner.getBoundingClientRect()
  if (state.partDrag) state.partDrag.rect = rect
  if (state.wireDraft) state.wireDraft.rect = rect
  if (state.ringDrag) state.ringDrag.rect = rect
}

function onPaletteDragStart(event: DragEvent) {
  const item = (event.target as Element).closest<HTMLElement>('.sb-pal-item')
  if (!item || !event.dataTransfer) return
  event.dataTransfer.setData('text/plain', item.dataset.type || '')
  event.dataTransfer.effectAllowed = 'copy'
}

function onPaletteClick(event: MouseEvent) {
  const item = (event.target as Element).closest<HTMLElement>('.sb-pal-item')
  if (!item) return
  placePart(item.dataset.type || '', 80, 80 + state.parts.length * 10)
}

function onCanvasDrop(event: DragEvent) {
  event.preventDefault()
  if (!event.dataTransfer) return
  const type = event.dataTransfer.getData('text/plain')
  if (!type || !COMPONENT_MAP[type]) return
  const point = canvasPoint(event.clientX, event.clientY)
  placePart(type, point.x, point.y)
}

function onPropsClick(event: MouseEvent) {
  const button = (event.target as Element).closest<HTMLElement>('[data-action]')
  if (!button) return
  const action = button.dataset.action

  if (action === 'rotate' && state.selectedPartId) {
    rotatePart(state.selectedPartId)
  }
  if (action === 'delete-part' && state.selectedPartId) {
    removePart(state.selectedPartId)
  }
  if (action === 'delete-wire') {
    removeFlexWire(button.dataset.fwId || '')
  }
  if (action === 'resistor' && state.selectedPartId) {
    const part = findPart(state.selectedPartId)
    if (part) {
      part.state.resistanceOhm = parseFloat(button.dataset.value || '0')
      renderAll()
    }
  }
}

function onPropsInput(event: Event) {
  const slider = event.target as HTMLInputElement
  const action = slider.dataset.action
  if (!state.selectedPartId) return
  const part = findPart(state.selectedPartId)
  if (!part) return

  const value = parseFloat(slider.value)
  const label = els.propsPanel.querySelector('[data-value-for="' + action + '"]')

  if (action === 'rheostat') {
    part.state.value = value
    if (label) label.textContent = Math.round(value) + ' ' + t('ohm')
    runSimulation()
  }
  if (action === 'battery') {
    part.state.voltage = value
    if (label) label.textContent = value + ' ' + t('volt')
    runSimulation()
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  if (document.activeElement !== document.body) return

  if (state.selectedPartId) {
    removePart(state.selectedPartId)
  } else if (state.selectedFlexWireId) {
    removeFlexWire(state.selectedFlexWireId)
  }
}

function onClearClick() {
  if (state.parts.length === 0 && state.flexWires.length === 0) return
  if (!confirm(t('clearConfirm'))) return
  clearCanvas()
}

export function bindEvents() {
  els.palette.addEventListener('dragstart', onPaletteDragStart)
  els.palette.addEventListener('click', onPaletteClick)

  els.canvas.addEventListener('dragover', event => {
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  })
  els.canvas.addEventListener('drop', onCanvasDrop)
  els.canvas.addEventListener('selectstart', event => event.preventDefault())
  els.canvas.addEventListener('scroll', refreshDragRects)
  els.canvas.addEventListener('mouseleave', () => {
    if (state.wireDraft) {
      state.wireDraft = null
      renderWires()
    }
  })

  els.canvasInner.addEventListener('mousedown', onCanvasMouseDown)
  els.svgLayer.addEventListener('click', onWireLayerClick)

  els.propsPanel.addEventListener('click', onPropsClick)
  els.propsPanel.addEventListener('input', onPropsInput)

  els.clearBtn.addEventListener('click', onClearClick)
  els.saveBtn.addEventListener('click', saveCurrentScheme)

  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
