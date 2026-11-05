import type { Part, FlexWire, LogicalWire } from '../types'
import { COMPONENTS, COMPONENT_MAP, COMPONENT_TERMINALS, iconPath } from '../lib/components-data.js'
import { solve } from '../lib/circuit-engine.js'
import { updateSounds } from '../lib/audio.js'
import { RING_RADIUS, terminalPosition, flexWirePoints } from '../lib/geometry.js'
import { state, els, t, findPart, findFlexWire } from './state.js'

const SVG_NS = 'http://www.w3.org/2000/svg'

function partBox(partId: string): HTMLElement | null {
  return els.partsLayer.querySelector<HTMLElement>('.sb-part[data-part-id="' + partId + '"]')
}

export function applyStaticTexts() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(item => {
    item.textContent = t(item.dataset.i18n || '')
  })
  document.title = t('builderTitle')
  document.documentElement.lang = state.lang
}

export function renderPalette() {
  els.palette.innerHTML = ''
  COMPONENTS.forEach(def => {
    const item = document.createElement('div')
    item.className = 'sb-pal-item'
    item.draggable = true
    item.dataset.type = def.type
    item.title = def.label[state.lang]

    const img = document.createElement('img')
    img.src = iconPath(def.type)
    img.alt = def.type
    img.draggable = false
    item.appendChild(img)

    els.palette.appendChild(item)
  })
}

export function renderParts() {
  els.partsLayer.innerHTML = ''

  state.parts.forEach(part => {
    const def = COMPONENT_MAP[part.type]
    const box = document.createElement('div')

    let className = 'sb-part'
    if (state.selectedPartId === part.id) className += ' sb-part-selected'
    if (part.type === 'switch' && part.state.closed) className += ' sb-switch-closed'
    if (part.type === 'button' && part.state.pressed) className += ' sb-button-pressed'
    if (part.type === 'switch' || part.type === 'button') className += ' sb-clickable-control'

    box.className = className
    box.style.left = part.x + 'px'
    box.style.top = part.y + 'px'
    box.style.width = def.width + 'px'
    box.style.height = def.height + 'px'
    box.style.transform = 'rotate(' + (part.rotation || 0) + 'deg)'
    box.dataset.partId = part.id

    const img = document.createElement('img')
    img.src = iconPath(part.type)
    img.draggable = false
    img.className = 'sb-part-img'
    box.appendChild(img)

    if (part.type === 'switch' || part.type === 'button') {
      const on = part.type === 'switch' ? part.state.closed : part.state.pressed
      const indicator = document.createElement('div')
      indicator.className = 'sb-state-indicator'
      indicator.textContent = on ? '●' : '○'
      box.appendChild(indicator)
    }

    if (part.type === 'ammeter' || part.type === 'voltmeter') {
      const readout = document.createElement('div')
      readout.className = 'sb-meter-readout'
      box.appendChild(readout)
    }

    const terminals = COMPONENT_TERMINALS[part.type] || []
    terminals.forEach(terminal => {
      const dot = document.createElement('div')
      dot.className = 'sb-terminal'
      dot.style.left = terminal.x * def.width + 'px'
      dot.style.top = terminal.y * def.height + 'px'
      dot.dataset.partId = part.id
      dot.dataset.termLabel = terminal.label
      box.appendChild(dot)
    })

    els.partsLayer.appendChild(box)
  })
}

export function updateButtonVisual(partId: string, pressed: boolean) {
  const box = partBox(partId)
  if (!box) return
  box.classList.toggle('sb-button-pressed', pressed)
  const indicator = box.querySelector('.sb-state-indicator')
  if (indicator) indicator.textContent = pressed ? '●' : '○'
}

function renderFlexWire(fw: FlexWire, selected: boolean): string {
  const points = flexWirePoints(fw)
  const opacity = selected ? '1' : '0.92'
  let html = '<g class="sb-flexwire" data-fw-id="' + fw.id + '">'

  if (selected) {
    html += '<line class="sb-flexwire-glow" x1="' + fw.ax.toFixed(1) + '" y1="' + fw.ay.toFixed(1) + '" x2="' + fw.bx.toFixed(1) + '" y2="' + fw.by.toFixed(1) + '"/>'
  }

  html += '<polyline class="sb-flexwire-body" data-fw-id="' + fw.id + '" points="' + points.blue + '" stroke="#2c5fa8" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + opacity + '"/>'
  html += '<polyline class="sb-flexwire-body" data-fw-id="' + fw.id + '" points="' + points.red + '" stroke="#c43535" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + opacity + '"/>'

  const ends = [
    { end: 'A', x: fw.ax, y: fw.ay, snap: fw.snapA },
    { end: 'B', x: fw.bx, y: fw.by, snap: fw.snapB }
  ]

  ends.forEach(item => {
    const fill = item.snap ? '#d4a843' : '#fdf8ee'
    const stroke = item.snap ? '#b8864e' : '#9a8a72'
    html += '<circle class="sb-flexwire-ring" data-fw-id="' + fw.id + '" data-end="' + item.end + '" cx="' + item.x.toFixed(1) + '" cy="' + item.y.toFixed(1) + '" r="' + RING_RADIUS + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.5"/>'
    html += '<circle class="sb-flexwire-dot" data-end="' + item.end + '" cx="' + item.x.toFixed(1) + '" cy="' + item.y.toFixed(1) + '" r="3.5" fill="' + stroke + '"/>'
  })

  html += '</g>'
  return html
}

export function renderWires() {
  const width = els.canvasInner.offsetWidth || 2000
  const height = els.canvasInner.offsetHeight || 1600
  els.svgLayer.setAttribute('width', String(width))
  els.svgLayer.setAttribute('height', String(height))
  els.svgLayer.setAttribute('viewBox', '0 0 ' + width + ' ' + height)

  let html = ''

  state.wires.forEach(wire => {
    const fromPart = findPart(wire.fromPart)
    const toPart = findPart(wire.toPart)
    if (!fromPart || !toPart) return
    const a = terminalPosition(fromPart, wire.fromTerm)
    const b = terminalPosition(toPart, wire.toTerm)
    html += '<line class="sb-wire-line" data-wire-id="' + wire.id + '" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="#c43535" stroke-width="4" stroke-linecap="round"/>'
  })

  state.flexWires.forEach(fw => {
    html += renderFlexWire(fw, state.selectedFlexWireId === fw.id)
  })

  if (state.wireDraft) {
    const fromPart = findPart(state.wireDraft.fromPart)
    if (fromPart) {
      const a = terminalPosition(fromPart, state.wireDraft.fromTerm)
      const dx = state.wireDraft.curX - a.x
      const dy = state.wireDraft.curY - a.y
      if (Math.sqrt(dx * dx + dy * dy) >= 4) {
        html += '<line class="sb-wire-draft" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + state.wireDraft.curX.toFixed(1) + '" y2="' + state.wireDraft.curY.toFixed(1) + '" stroke="rgba(90,130,200,0.55)" stroke-width="2" stroke-dasharray="5,5" stroke-linecap="round"/>'
      }
    }
  }

  els.svgLayer.innerHTML = html
}

export function updateFlexWireBody(fw: FlexWire) {
  const group = els.svgLayer.querySelector('.sb-flexwire[data-fw-id="' + fw.id + '"]')
  if (!group) {
    renderWires()
    return
  }

  const points = flexWirePoints(fw)
  const bodies = group.querySelectorAll('.sb-flexwire-body')
  if (bodies.length >= 2) {
    bodies[0].setAttribute('points', points.blue)
    bodies[1].setAttribute('points', points.red)
  }

  const glow = group.querySelector('.sb-flexwire-glow')
  if (glow) {
    glow.setAttribute('x1', fw.ax.toFixed(1))
    glow.setAttribute('y1', fw.ay.toFixed(1))
    glow.setAttribute('x2', fw.bx.toFixed(1))
    glow.setAttribute('y2', fw.by.toFixed(1))
  }

  const ends = [
    { end: 'A', x: fw.ax, y: fw.ay },
    { end: 'B', x: fw.bx, y: fw.by }
  ]
  ends.forEach(item => {
    const ring = group.querySelector('.sb-flexwire-ring[data-end="' + item.end + '"]')
    const dot = group.querySelector('.sb-flexwire-dot[data-end="' + item.end + '"]')
    if (ring) {
      ring.setAttribute('cx', item.x.toFixed(1))
      ring.setAttribute('cy', item.y.toFixed(1))
    }
    if (dot) {
      dot.setAttribute('cx', item.x.toFixed(1))
      dot.setAttribute('cy', item.y.toFixed(1))
    }
  })
}

export function updateSelectionHighlight() {
  els.partsLayer.querySelectorAll<HTMLElement>('.sb-part').forEach(box => {
    box.classList.toggle('sb-part-selected', box.dataset.partId === state.selectedPartId)
  })

  els.svgLayer.querySelectorAll('.sb-flexwire-body').forEach(body => {
    const selected = body.getAttribute('data-fw-id') === state.selectedFlexWireId
    body.setAttribute('opacity', selected ? '1' : '0.92')
  })

  els.svgLayer.querySelectorAll('.sb-flexwire-glow').forEach(glow => glow.remove())

  if (!state.selectedFlexWireId) return
  const fw = findFlexWire(state.selectedFlexWireId)
  if (!fw) return
  const group = els.svgLayer.querySelector('.sb-flexwire[data-fw-id="' + fw.id + '"]')
  if (!group) return

  const glow = document.createElementNS(SVG_NS, 'line')
  glow.setAttribute('class', 'sb-flexwire-glow')
  glow.setAttribute('x1', fw.ax.toFixed(1))
  glow.setAttribute('y1', fw.ay.toFixed(1))
  glow.setAttribute('x2', fw.bx.toFixed(1))
  glow.setAttribute('y2', fw.by.toFixed(1))
  group.insertBefore(glow, group.firstChild)
}

export function renderPropsPanel() {
  const panel = els.propsPanel

  if (state.selectedFlexWireId) {
    const fw = findFlexWire(state.selectedFlexWireId)
    if (!fw) {
      panel.innerHTML = ''
      panel.classList.remove('open')
      return
    }
    panel.classList.add('open')

    const ends = (fw.snapA ? 'A: ' + t('connected') : 'A: ' + t('notConnected')) + '<br>' + (fw.snapB ? 'B: ' + t('connected') : 'B: ' + t('notConnected'))
    let wireHtml = '<div class="sb-props-title">' + COMPONENT_MAP.wire.label[state.lang] + '</div>'
    wireHtml += '<div class="sb-props-desc"><strong>' + COMPONENT_MAP.wire.label[state.lang] + '</strong>' + t('desc_wire') + '</div>'
    wireHtml += '<div class="sb-props-value">' + ends + '</div>'
    wireHtml += '<div class="sb-props-actions">'
    wireHtml += '<button class="sb-btn-delete" data-action="delete-wire" data-fw-id="' + fw.id + '">' + t('deleteSelected') + '</button>'
    wireHtml += '</div>'
    panel.innerHTML = wireHtml
    return
  }

  const part = state.selectedPartId ? findPart(state.selectedPartId) : undefined
  if (!part) {
    panel.innerHTML = ''
    panel.classList.remove('open')
    return
  }
  panel.classList.add('open')

  const def = COMPONENT_MAP[part.type]
  const label = def.label[state.lang]
  let html = '<div class="sb-props-title">' + label + '</div>'
  html += '<div class="sb-props-desc"><strong>' + label + '</strong>' + t('desc_' + part.type) + '</div>'

  if (part.type === 'rheostat') {
    const value = Number(part.state.value)
    html += '<label class="sb-props-label">' + t('propValue') + ' (' + t('ohm') + ')</label>'
    html += '<input type="range" min="' + def.minOhm + '" max="' + def.maxOhm + '" value="' + value + '" class="sb-rheostat-slider" data-action="rheostat">'
    html += '<div class="sb-props-value" data-value-for="rheostat">' + Math.round(value) + ' ' + t('ohm') + '</div>'
  }

  if (part.type === 'battery') {
    const voltage = typeof part.state.voltage === 'number' ? part.state.voltage : def.emfV
    html += '<label class="sb-props-label">' + t('propVoltage') + ' (' + t('volt') + ')</label>'
    html += '<input type="range" min="' + def.minVoltage + '" max="' + def.maxVoltage + '" step="0.5" value="' + voltage + '" class="sb-battery-slider" data-action="battery">'
    html += '<div class="sb-props-value" data-value-for="battery">' + voltage + ' ' + t('volt') + '</div>'
  }

  if (part.type === 'resistor') {
    const current = typeof part.state.resistanceOhm === 'number' ? part.state.resistanceOhm : def.resistanceOhm
    html += '<label class="sb-props-label">' + t('propValue') + ' (' + t('ohm') + ')</label>'
    html += '<div class="sb-resistor-options">'
    ;(def.resistorOptions || []).forEach(ohm => {
      const active = ohm === current ? ' sb-resistor-opt-active' : ''
      html += '<button class="sb-resistor-opt' + active + '" data-action="resistor" data-value="' + ohm + '">' + ohm + '</button>'
    })
    html += '</div>'
  }

  if (part.type === 'switch') {
    html += '<div class="sb-props-value">' + (part.state.closed ? t('switchClosed') : t('switchOpen')) + '</div>'
  }

  if (part.type === 'button') {
    html += '<div class="sb-props-hint">' + t('buttonHint') + '</div>'
  }

  if (part.type === 'fuse' && part.state.blown) {
    html += '<div class="sb-props-warning">' + t('fuseBlown') + '</div>'
  }

  html += '<div class="sb-props-actions">'
  html += '<button class="sb-btn-rotate" data-action="rotate">' + t('rotateSelected') + '</button>'
  html += '<button class="sb-btn-delete" data-action="delete-part">' + t('deleteSelected') + '</button>'
  html += '</div>'

  panel.innerHTML = html
}

export function flexWiresToLogicalWires(): LogicalWire[] {
  const result: LogicalWire[] = []
  state.flexWires.forEach(fw => {
    if (fw.snapA && fw.snapB) {
      result.push({
        id: fw.id,
        fromPart: fw.snapA.partId,
        fromTerm: fw.snapA.term,
        toPart: fw.snapB.partId,
        toTerm: fw.snapB.term
      })
    }
  })
  return result
}

export function updateSaveButton() {
  const hasContent = state.parts.length > 0 || state.flexWires.length > 0
  els.saveBtn.classList.toggle('sb-visible', hasContent)
}

function updateMeter(part: Part, box: HTMLElement, current: number, voltage: number) {
  let readout = box.querySelector<HTMLElement>('.sb-meter-readout')
  if (!readout) {
    readout = document.createElement('div')
    readout.className = 'sb-meter-readout'
    box.appendChild(readout)
  }

  if (part.type === 'ammeter') {
    const value = Math.abs(current)
    readout.textContent = value.toFixed(2) + ' ' + t('ampere')
    readout.style.color = value > 0.001 ? '#d4a843' : ''
  } else {
    const value = Math.abs(voltage)
    readout.textContent = value.toFixed(2) + ' ' + t('volt')
    readout.style.color = value > 0.001 ? '#d4a843' : ''
  }
}

function updateCapacitor(box: HTMLElement, voltage: number) {
  let bar = box.querySelector<HTMLElement>('.sb-cap-bar')
  let readout = box.querySelector<HTMLElement>('.sb-cap-readout')

  if (voltage <= 0.1) {
    if (bar) bar.remove()
    if (readout) readout.remove()
    return
  }

  box.classList.add('sb-cap-charging')

  if (!bar) {
    bar = document.createElement('div')
    bar.className = 'sb-cap-bar'
    box.appendChild(bar)
  }
  bar.style.width = Math.min(100, (voltage / 15) * 100).toFixed(0) + '%'

  if (!readout) {
    readout = document.createElement('div')
    readout.className = 'sb-cap-readout sb-meter-readout'
    box.appendChild(readout)
  }
  readout.textContent = voltage.toFixed(1) + ' ' + t('volt')
}

export function runSimulation() {
  const wires = state.wires.concat(flexWiresToLogicalWires())
  const result = solve(state.parts, wires)

  state.parts.forEach(part => {
    if (part.type === 'fuse' && result.blownFuses[part.id]) {
      part.state.blown = true
    }
  })

  const wantedSounds: Record<string, string> = {}

  state.parts.forEach(part => {
    const box = partBox(part.id)
    if (!box) return

    box.classList.remove('sb-active-glow', 'sb-active-spin', 'sb-active-sound', 'sb-fuse-blown', 'sb-inductor-active', 'sb-cap-charging')

    if (part.type === 'fuse' && part.state.blown) {
      box.classList.add('sb-fuse-blown')
    } else if (result.active[part.id]) {
      if (part.type === 'lamp' || part.type === 'led') {
        box.classList.add('sb-active-glow')
      }
      if (part.type === 'motor') {
        box.classList.add('sb-active-spin')
        wantedSounds[part.id] = 'motor'
      }
      if (part.type === 'buzzer') {
        box.classList.add('sb-active-sound')
        wantedSounds[part.id] = 'buzzer'
      }
      if (part.type === 'inductor') {
        box.classList.add('sb-inductor-active')
        wantedSounds[part.id] = 'inductor'
      }
    }

    if (part.type === 'capacitor') {
      updateCapacitor(box, Math.abs(result.partVoltage[part.id] || 0))
    }

    if (part.type === 'ammeter' || part.type === 'voltmeter') {
      updateMeter(part, box, result.branchCurrent[part.id] || 0, result.partVoltage[part.id] || 0)
    }
  })

  updateSounds(wantedSounds)
  updateSaveButton()
}

export function renderAll() {
  renderParts()
  renderWires()
  renderPropsPanel()
  runSimulation()
  const empty = state.parts.length === 0 && state.flexWires.length === 0
  els.canvasHint.style.display = empty ? '' : 'none'
}
