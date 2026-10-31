import type { Part, LogicalWire, CircuitResult } from '../types'
import { COMPONENT_MAP, COMPONENT_TERMINALS } from './components-data'

interface Branch {
  partId: string
  partType: string
  nodeA: number
  nodeB: number
  resistance: number
  emf: number
  isOpen: boolean
  isMeterVoltage: boolean
}

class UnionFind {
  private parent: number[]

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i)
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]
      x = this.parent[x]
    }
    return x
  }

  union(a: number, b: number) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent[ra] = rb
  }
}

function termKey(partId: string, label: string): string {
  return partId + ':' + label
}

function buildBranch(part: Part, nodeA: number, nodeB: number): Branch {
  const def = COMPONENT_MAP[part.type]
  const terms = COMPONENT_TERMINALS[part.type] || []

  const branch: Branch = {
    partId: part.id,
    partType: part.type,
    nodeA,
    nodeB,
    resistance: 1e9,
    emf: 0,
    isOpen: false,
    isMeterVoltage: false
  }

  switch (part.type) {
    case 'battery': {
      const v = typeof part.state.voltage === 'number' ? part.state.voltage : (def?.emfV ?? 9)
      branch.emf = v
      branch.resistance = def?.internalOhm ?? 0.5
      if (terms[0]?.label === 'neg') branch.emf = -branch.emf
      break
    }
    case 'resistor': {
      const r = typeof part.state.resistanceOhm === 'number' ? part.state.resistanceOhm : (def?.resistanceOhm ?? 100)
      branch.resistance = r
      break
    }
    case 'rheostat': {
      const v = typeof part.state.value === 'number' ? part.state.value : (def?.resistanceOhm ?? 50)
      branch.resistance = v
      break
    }
    case 'switch': {
      branch.isOpen = !(part.state.closed === true)
      branch.resistance = 0.02
      break
    }
    case 'button': {
      branch.isOpen = !(part.state.pressed === true)
      branch.resistance = 0.02
      break
    }
    case 'fuse': {
      if (part.state.blown === true) {
        branch.isOpen = true
      } else {
        branch.resistance = def?.internalOhm ?? 0.05
      }
      break
    }
    case 'capacitor': {
      branch.isOpen = true
      branch.isMeterVoltage = true
      break
    }
    case 'voltmeter': {
      branch.resistance = def?.internalOhm ?? 1000000
      branch.isMeterVoltage = true
      break
    }
    case 'ammeter': {
      branch.resistance = def?.internalOhm ?? 0.01
      break
    }
    case 'led':
    case 'diode': {
      branch.resistance = def?.resistanceOhm ?? 20
      break
    }
    default: {
      branch.resistance = def?.resistanceOhm ?? def?.internalOhm ?? 0.02
      break
    }
  }

  return branch
}

function solveMatrix(n: number, G: number[][], I: number[]): number[] {
  const size = n
  const A = G.map(row => [...row])
  const b = [...I]

  for (let col = 0; col < size; col++) {
    let maxRow = col
    for (let row = col + 1; row < size; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row
    }
    ;[A[col], A[maxRow]] = [A[maxRow], A[col]]
    ;[b[col], b[maxRow]] = [b[maxRow], b[col]]

    if (Math.abs(A[col][col]) < 1e-12) continue

    for (let row = col + 1; row < size; row++) {
      const factor = A[row][col] / A[col][col]
      for (let k = col; k < size; k++) A[row][k] -= factor * A[col][k]
      b[row] -= factor * b[col]
    }
  }

  const x = new Array(size).fill(0)
  for (let i = size - 1; i >= 0; i--) {
    if (Math.abs(A[i][i]) < 1e-12) continue
    x[i] = b[i]
    for (let j = i + 1; j < size; j++) x[i] -= A[i][j] * x[j]
    x[i] /= A[i][i]
  }
  return x
}

export function solve(parts: Part[], wires: LogicalWire[]): CircuitResult {
  const result: CircuitResult = {
    branchCurrent: {},
    partVoltage: {},
    active: {},
    blownFuses: {},
    errors: []
  }

  const allTermKeys: string[] = []
  parts.forEach(p => {
    const terms = COMPONENT_TERMINALS[p.type] || []
    terms.forEach(t => allTermKeys.push(termKey(p.id, t.label)))
  })

  const uf = new UnionFind(allTermKeys.length + 1)
  const keyIndex = new Map<string, number>()
  allTermKeys.forEach((k, i) => keyIndex.set(k, i))

  allTermKeys.forEach(k => uf.find(keyIndex.get(k)!))

  wires.forEach(w => {
    const a = keyIndex.get(termKey(w.fromPart, w.fromTerm))
    const b = keyIndex.get(termKey(w.toPart, w.toTerm))
    if (a !== undefined && b !== undefined) uf.union(a, b)
  })

  const nodeMap = new Map<number, number>()
  let nodeCount = 0
  allTermKeys.forEach((_, i) => {
    const root = uf.find(i)
    if (!nodeMap.has(root)) nodeMap.set(root, nodeCount++)
  })

  const getNode = (partId: string, termLabel: string): number => {
    const idx = keyIndex.get(termKey(partId, termLabel))
    if (idx === undefined) return -1
    return nodeMap.get(uf.find(idx)) ?? -1
  }

  const branches: Branch[] = []
  const emfBranches: Branch[] = []

  parts.forEach(p => {
    const terms = COMPONENT_TERMINALS[p.type] || []
    if (terms.length < 2) return
    const nA = getNode(p.id, terms[0].label)
    const nB = getNode(p.id, terms[1].label)
    if (nA < 0 || nB < 0 || nA === nB) return

    const br = buildBranch(p, nA, nB)
    if (br.emf !== 0) emfBranches.push(br)
    else branches.push(br)
  })

  const allBranches = [...branches, ...emfBranches]
  const resistive = allBranches.filter(b => !b.isOpen && b.emf === 0)
  const sources = allBranches.filter(b => !b.isOpen && b.emf !== 0)

  if (nodeCount === 0 || (resistive.length === 0 && sources.length === 0)) return result

  const groundNode = 0
  const freeNodes = nodeCount - 1
  const numVSrc = sources.length
  const matSize = freeNodes + numVSrc

  if (matSize === 0) return result

  const G = Array.from({ length: matSize }, () => new Array(matSize).fill(0))
  const I = new Array(matSize).fill(0)

  const idx = (n: number) => n - 1

  resistive.forEach(br => {
    const g = 1 / Math.max(br.resistance, 1e-9)
    if (br.nodeA !== groundNode) {
      G[idx(br.nodeA)][idx(br.nodeA)] += g
      if (br.nodeB !== groundNode) {
        G[idx(br.nodeA)][idx(br.nodeB)] -= g
      }
    }
    if (br.nodeB !== groundNode) {
      G[idx(br.nodeB)][idx(br.nodeB)] += g
      if (br.nodeA !== groundNode) {
        G[idx(br.nodeB)][idx(br.nodeA)] -= g
      }
    }
  })

  sources.forEach((br, k) => {
    const col = freeNodes + k
    if (br.nodeA !== groundNode) {
      G[idx(br.nodeA)][col] += 1
      G[col][idx(br.nodeA)] += 1
    }
    if (br.nodeB !== groundNode) {
      G[idx(br.nodeB)][col] -= 1
      G[col][idx(br.nodeB)] -= 1
    }
    I[col] += br.emf
    const g = 1 / Math.max(br.resistance, 1e-9)
    if (br.nodeA !== groundNode) G[idx(br.nodeA)][idx(br.nodeA)] += g
    if (br.nodeB !== groundNode) G[idx(br.nodeB)][idx(br.nodeB)] += g
    if (br.nodeA !== groundNode && br.nodeB !== groundNode) {
      G[idx(br.nodeA)][idx(br.nodeB)] -= g
      G[idx(br.nodeB)][idx(br.nodeA)] -= g
    }
  })

  const solution = solveMatrix(matSize, G, I)

  const voltage = (n: number) => n === groundNode ? 0 : (solution[idx(n)] ?? 0)

  allBranches.forEach((br, k) => {
    if (br.isOpen) {
      result.branchCurrent[br.partId] = 0
      result.partVoltage[br.partId] = Math.abs(voltage(br.nodeA) - voltage(br.nodeB))
      return
    }
    let current: number
    if (br.emf !== 0) {
      const srcIdx = sources.indexOf(br)
      current = srcIdx >= 0 ? (solution[freeNodes + srcIdx] ?? 0) : 0
    } else {
      const va = voltage(br.nodeA)
      const vb = voltage(br.nodeB)
      current = (va - vb) / Math.max(br.resistance, 1e-9)
    }
    result.branchCurrent[br.partId] = current
    result.partVoltage[br.partId] = Math.abs(voltage(br.nodeA) - voltage(br.nodeB))
  })

  parts.forEach(p => {
    const def = COMPONENT_MAP[p.type]
    if (!def) return

    const current = Math.abs(result.branchCurrent[p.id] ?? 0)
    const volt = result.partVoltage[p.id] ?? 0

    if (p.type === 'fuse') {
      const max = def.maxCurrentA ?? 1.5
      if (current > max) result.blownFuses[p.id] = true
    }

    if (p.type === 'voltmeter') {
      result.partVoltage[p.id] = volt
      return
    }

    if (def.polarized) {
      const terms = COMPONENT_TERMINALS[p.type] || []
      const nA = getNode(p.id, terms[0].label)
      const nB = getNode(p.id, terms[1].label)
      const va = voltage(nA)
      const vb = voltage(nB)
      const forward = terms[0].label === 'a' ? va > vb : vb > va
      if (!forward) return
    }

    const minI = def.minCurrentA
    if (minI !== undefined) {
      result.active[p.id] = current >= minI
    } else if (p.type === 'ammeter') {
      result.active[p.id] = current > 0.0001
    } else if (p.type === 'inductor') {
      result.active[p.id] = current > 0.001
    } else if (p.type === 'capacitor') {
      result.active[p.id] = volt > 0.1
    }
  })

  return result
}
