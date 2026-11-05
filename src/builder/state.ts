import type { Part, FlexWire, LogicalWire, Lang } from '../types'
import { translate } from '../lib/i18n.js'
import { getLang } from '../lib/lang.js'

export interface PartDrag {
  partId: string
  offsetX: number
  offsetY: number
  rect: DOMRect
}

export interface PendingPress {
  partId: string
  startX: number
  startY: number
  moved: boolean
}

export interface WireDraft {
  fromPart: string
  fromTerm: string
  curX: number
  curY: number
  rect: DOMRect
}

export interface RingDrag {
  fwId: string
  end: 'A' | 'B'
  rect: DOMRect
}

export interface BuilderState {
  lang: Lang
  parts: Part[]
  wires: LogicalWire[]
  flexWires: FlexWire[]
  nextPartSeq: number
  nextWireSeq: number
  selectedPartId: string | null
  selectedFlexWireId: string | null
  currentSchemeId: number | null
  currentSchemeTitle: string
  pendingPress: PendingPress | null
  partDrag: PartDrag | null
  wireDraft: WireDraft | null
  ringDrag: RingDrag | null
  lastRingClick: { key: string; time: number } | null
  lastWireClick: { id: string; time: number } | null
  isLoggedIn: boolean
  userEmail: string
}

export const state: BuilderState = {
  lang: getLang(),
  parts: [],
  wires: [],
  flexWires: [],
  nextPartSeq: 1,
  nextWireSeq: 1,
  selectedPartId: null,
  selectedFlexWireId: null,
  currentSchemeId: null,
  currentSchemeTitle: '',
  pendingPress: null,
  partDrag: null,
  wireDraft: null,
  ringDrag: null,
  lastRingClick: null,
  lastWireClick: null,
  isLoggedIn: false,
  userEmail: ''
}

export interface Elements {
  palette: HTMLElement
  canvas: HTMLElement
  canvasInner: HTMLElement
  svgLayer: SVGSVGElement
  partsLayer: HTMLElement
  accountBtn: HTMLElement
  accountLabel: HTMLElement
  accountMenu: HTMLElement
  authModal: HTMLElement
  schemesModal: HTMLElement
  saveBtn: HTMLElement
  clearBtn: HTMLElement
  propsPanel: HTMLElement
  toast: HTMLElement
  canvasHint: HTMLElement
}

export let els: Elements

function byId(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement
}

export function cacheDom() {
  els = {
    palette: byId('sb-palette'),
    canvas: byId('sb-canvas'),
    canvasInner: byId('sb-canvas-inner'),
    svgLayer: document.getElementById('sb-wire-layer') as unknown as SVGSVGElement,
    partsLayer: byId('sb-parts-layer'),
    accountBtn: byId('sb-account-btn'),
    accountLabel: byId('sb-account-label'),
    accountMenu: byId('sb-account-menu'),
    authModal: byId('sb-auth-modal'),
    schemesModal: byId('sb-schemes-modal'),
    saveBtn: byId('sb-save-btn'),
    clearBtn: byId('sb-clear-btn'),
    propsPanel: byId('sb-props-panel'),
    toast: byId('sb-toast'),
    canvasHint: byId('sb-canvas-hint')
  }
}

export function t(key: string): string {
  return translate(state.lang, key)
}

export function newPartId(): string {
  const id = 'p' + state.nextPartSeq
  state.nextPartSeq++
  return id
}

export function newWireId(prefix: string): string {
  const id = prefix + state.nextWireSeq
  state.nextWireSeq++
  return id
}

let toastTimer = 0

export function showToast(message: string) {
  els.toast.textContent = message
  els.toast.classList.add('show')
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 2400)
}

export function findPart(partId: string): Part | undefined {
  return state.parts.filter(part => part.id === partId)[0]
}

export function findFlexWire(fwId: string): FlexWire | undefined {
  return state.flexWires.filter(wire => wire.id === fwId)[0]
}
