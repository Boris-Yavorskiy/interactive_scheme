export interface Part {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  state: Record<string, unknown>
}

export interface FlexWire {
  id: string
  ax: number
  ay: number
  bx: number
  by: number
  snapA: SnapPoint | null
  snapB: SnapPoint | null
}

export interface SnapPoint {
  partId: string
  term: string
}

export interface LogicalWire {
  id: string
  fromPart: string
  fromTerm: string
  toPart: string
  toTerm: string
}

export interface Terminal {
  label: string
  x: number
  y: number
}

export interface ComponentDef {
  type: string
  category: string
  label: { uk: string; en: string }
  width: number
  height: number
  resistanceOhm?: number
  resistorOptions?: number[]
  emfV?: number
  minVoltage?: number
  maxVoltage?: number
  internalOhm?: number
  polarized?: boolean
  forwardDropV?: number
  minCurrentA?: number
  maxCurrentA?: number
  isMeter?: boolean
  isOpenByDefault?: boolean
  momentary?: boolean
  variable?: boolean
  minOhm?: number
  maxOhm?: number
  isCapacitor?: boolean
}

export interface CircuitResult {
  nodeVoltage: Record<string, number>
  branchCurrent: Record<string, number>
  partVoltage: Record<string, number>
  active: Record<string, boolean>
  blownFuses: Record<string, boolean>
  errors: string[]
}

export interface SchemeData {
  parts: Part[]
  wires: LogicalWire[]
  flexWires: FlexWire[]
}

export interface SavedScheme {
  id: number
  title: string
  updatedAt: string
}

export type Lang = 'uk' | 'en'
