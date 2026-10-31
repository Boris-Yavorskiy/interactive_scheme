import type { Part, LogicalWire, CircuitResult } from '../types'
import { COMPONENT_MAP, COMPONENT_TERMINALS } from './components-data.js'

const EPS = 1e-9

interface Branch {
  partId: string
  type: string
  nodeA: string
  nodeB: string
  resistance: number
  emf: number
  isOpen: boolean
  forwardDropV: number
  diodeConducting: boolean
}

interface MnaResult {
  nodeVoltage: Record<string, number>
  branchCurrent: Record<string, number>
}

class UnionFind {
  private parent: Record<string, string> = {}

  find(x: string): string {
    if (!(x in this.parent)) this.parent[x] = x
    let root = x
    while (this.parent[root] !== root) root = this.parent[root]
    let cur = x
    while (this.parent[cur] !== root) {
      const next = this.parent[cur]
      this.parent[cur] = root
      cur = next
    }
    return root
  }

  union(a: string, b: string) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent[ra] = rb
  }
}

function termKey(partId: string, label: string): string {
  return partId + '::' + label
}

function buildNodes(parts: Part[], wires: LogicalWire[]): UnionFind {
  const uf = new UnionFind()

  parts.forEach(p => {
    if (!COMPONENT_MAP[p.type]) return
    const terms = COMPONENT_TERMINALS[p.type] || []
    terms.forEach(t => uf.find(termKey(p.id, t.label)))
  })

  wires.forEach(w => {
    uf.union(termKey(w.fromPart, w.fromTerm), termKey(w.toPart, w.toTerm))
  })

  return uf
}

function describeBranch(part: Part, uf: UnionFind, conducting: Record<string, boolean>): Branch | null {
  const def = COMPONENT_MAP[part.type]
  const terms = COMPONENT_TERMINALS[part.type] || []
  if (!def || terms.length < 2) return null

  const branch: Branch = {
    partId: part.id,
    type: part.type,
    nodeA: uf.find(termKey(part.id, terms[0].label)),
    nodeB: uf.find(termKey(part.id, terms[1].label)),
    resistance: 0,
    emf: 0,
    isOpen: false,
    forwardDropV: 0,
    diodeConducting: true
  }

  const state = part.state || {}

  switch (part.type) {
    case 'battery':
      branch.emf = typeof state.voltage === 'number' ? state.voltage : (def.emfV ?? 9)
      branch.resistance = def.internalOhm ?? 0
      if (terms[0].label === 'neg') branch.emf = -branch.emf
      break

    case 'switch':
      branch.isOpen = state.closed ? false : true
      branch.resistance = def.internalOhm ?? 0
      break

    case 'button':
      branch.isOpen = state.pressed ? false : true
      branch.resistance = def.internalOhm ?? 0
      break

    case 'fuse':
      if (state.blown) {
        branch.isOpen = true
      } else {
        branch.resistance = def.internalOhm ?? 0
      }
      break

    case 'rheostat': {
      const value = typeof state.value === 'number' ? state.value : (def.resistanceOhm ?? 0)
      branch.resistance = Math.max(def.minOhm ?? 0, Math.min(def.maxOhm ?? 500, value))
      break
    }

    case 'voltmeter':
      branch.isOpen = true
      break

    case 'ammeter':
      branch.resistance = def.internalOhm ?? 0
      break

    case 'capacitor':
      branch.isOpen = true
      break

    case 'inductor':
      branch.resistance = def.internalOhm ?? 0
      break

    case 'diode':
    case 'led':
      branch.forwardDropV = def.forwardDropV ?? 0
      branch.resistance = def.resistanceOhm ?? 0
      if (part.id in conducting) branch.diodeConducting = conducting[part.id]
      if (!branch.diodeConducting) branch.isOpen = true
      break

    case 'resistor':
      branch.resistance = typeof state.resistanceOhm === 'number' ? state.resistanceOhm : (def.resistanceOhm ?? 0)
      break

    default:
      if (def.resistanceOhm !== undefined) branch.resistance = def.resistanceOhm
      else if (def.internalOhm !== undefined) branch.resistance = def.internalOhm
      else branch.resistance = 0.02
      break
  }

  return branch
}

function gaussianSolve(A: number[][], z: number[]): number[] {
  const n = z.length
  const M = A.map((row, i) => row.concat([z[i]]))

  for (let col = 0; col < n; col++) {
    let pivotRow = col
    let maxAbs = Math.abs(M[col][col])
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > maxAbs) {
        maxAbs = Math.abs(M[r][col])
        pivotRow = r
      }
    }
    if (maxAbs < 1e-12) continue

    if (pivotRow !== col) {
      const tmp = M[col]
      M[col] = M[pivotRow]
      M[pivotRow] = tmp
    }

    const pivotVal = M[col][col]
    for (let c = col; c <= n; c++) M[col][c] /= pivotVal

    for (let r2 = 0; r2 < n; r2++) {
      if (r2 === col) continue
      const factor = M[r2][col]
      if (Math.abs(factor) < 1e-15) continue
      for (let c2 = col; c2 <= n; c2++) {
        M[r2][c2] -= factor * M[col][c2]
      }
    }
  }

  const x: number[] = []
  for (let i = 0; i < n; i++) x.push(M[i][n])
  return x
}

function solveMNA(branches: Branch[], nodeList: string[]): MnaResult | null {
  if (nodeList.length === 0) return { nodeVoltage: {}, branchCurrent: {} }

  const groundNode = nodeList[0]
  const nodeIndex: Record<string, number> = {}
  let idx = 0
  nodeList.forEach(n => {
    if (n === groundNode) return
    nodeIndex[n] = idx++
  })
  const numNodes = idx

  const activeBranches = branches.filter(b => !b.isOpen)
  const emfBranches = activeBranches.filter(b => Math.abs(b.emf) > EPS || b.forwardDropV > EPS)
  const resistiveBranches = activeBranches.filter(b => Math.abs(b.emf) <= EPS && b.forwardDropV <= EPS)

  const size = numNodes + emfBranches.length
  if (size === 0) return { nodeVoltage: {}, branchCurrent: {} }

  const A: number[][] = []
  for (let r = 0; r < size; r++) A.push(new Array(size).fill(0))
  const z: number[] = new Array(size).fill(0)

  const nIdx = (nodeId: string): number => (nodeId === groundNode ? -1 : nodeIndex[nodeId])

  resistiveBranches.forEach(b => {
    const g = 1 / Math.max(b.resistance, 1e-6)
    const ia = nIdx(b.nodeA)
    const ib = nIdx(b.nodeB)
    if (ia >= 0) A[ia][ia] += g
    if (ib >= 0) A[ib][ib] += g
    if (ia >= 0 && ib >= 0) {
      A[ia][ib] -= g
      A[ib][ia] -= g
    }
  })

  emfBranches.forEach((b, k) => {
    const row = numNodes + k
    const ia = nIdx(b.nodeA)
    const ib = nIdx(b.nodeB)

    if (ia >= 0) A[ia][row] += 1
    if (ib >= 0) A[ib][row] -= 1

    const rSeries = Math.max(b.resistance, 1e-6)
    if (ia >= 0) A[row][ia] += 1
    if (ib >= 0) A[row][ib] -= 1
    A[row][row] -= rSeries

    z[row] = b.emf - b.forwardDropV
  })

  const solution = gaussianSolve(A, z)

  const nodeVoltage: Record<string, number> = {}
  nodeVoltage[groundNode] = 0
  nodeList.forEach(n => {
    if (n === groundNode) return
    nodeVoltage[n] = solution[nodeIndex[n]]
  })

  const branchCurrent: Record<string, number> = {}

  resistiveBranches.forEach(b => {
    const va = nodeVoltage[b.nodeA] || 0
    const vb = nodeVoltage[b.nodeB] || 0
    branchCurrent[b.partId] = (va - vb) / Math.max(b.resistance, 1e-6)
  })

  emfBranches.forEach((b, k) => {
    branchCurrent[b.partId] = solution[numNodes + k]
  })

  return { nodeVoltage, branchCurrent }
}

export function solve(parts: Part[], wires: LogicalWire[]): CircuitResult {
  const errors: string[] = []
  const uf = buildNodes(parts, wires)

  const polarizedParts = parts.filter(p => p.type === 'diode' || p.type === 'led')

  const conducting: Record<string, boolean> = {}
  polarizedParts.forEach(p => {
    conducting[p.id] = true
  })

  let nodeVoltage: Record<string, number> = {}
  let branchCurrent: Record<string, number> = {}
  const maxIter = polarizedParts.length + 3

  for (let iter = 0; iter < maxIter; iter++) {
    const branches: Branch[] = []
    parts.forEach(p => {
      const b = describeBranch(p, uf, conducting)
      if (b) branches.push(b)
    })

    const allNodes: Record<string, boolean> = {}
    branches.forEach(b => {
      allNodes[b.nodeA] = true
      allNodes[b.nodeB] = true
    })

    const result = solveMNA(branches, Object.keys(allNodes))
    if (!result) {
      errors.push("Не вдалося розв'язати схему (вироджена матриця).")
      break
    }
    nodeVoltage = result.nodeVoltage
    branchCurrent = result.branchCurrent

    let changed = false
    polarizedParts.forEach(p => {
      const branch = branches.filter(b => b.partId === p.id)[0]
      if (!branch) return

      if (conducting[p.id]) {
        const i = branchCurrent[p.id] || 0
        if (i < -EPS) {
          conducting[p.id] = false
          changed = true
        }
      } else {
        const va = nodeVoltage[branch.nodeA] || 0
        const vb = nodeVoltage[branch.nodeB] || 0
        const def = COMPONENT_MAP[p.type]
        if (va - vb > (def.forwardDropV ?? 0) + EPS) {
          conducting[p.id] = true
          changed = true
        }
      }
    })

    if (!changed) break
  }

  const finalBranches: Branch[] = []
  parts.forEach(p => {
    const b = describeBranch(p, uf, conducting)
    if (b) finalBranches.push(b)
  })

  const partVoltage: Record<string, number> = {}
  const active: Record<string, boolean> = {}
  const blownFuses: Record<string, boolean> = {}

  finalBranches.forEach(b => {
    const va = nodeVoltage[b.nodeA] || 0
    const vb = nodeVoltage[b.nodeB] || 0
    partVoltage[b.partId] = va - vb
  })

  parts.forEach(p => {
    if (p.type !== 'voltmeter') return
    const terms = COMPONENT_TERMINALS.voltmeter
    const nodeA = uf.find(termKey(p.id, terms[0].label))
    const nodeB = uf.find(termKey(p.id, terms[1].label))
    const va = nodeVoltage[nodeA] || 0
    const vb = nodeVoltage[nodeB] || 0
    partVoltage[p.id] = va - vb
    branchCurrent[p.id] = 0
  })

  parts.forEach(p => {
    const def = COMPONENT_MAP[p.type]
    if (!def) return
    const current = Math.abs(branchCurrent[p.id] || 0)

    if (p.type === 'fuse' && current > (def.maxCurrentA ?? 1.5) + EPS) {
      blownFuses[p.id] = true
    }

    if (def.minCurrentA !== undefined && current >= def.minCurrentA) {
      active[p.id] = true
    }

    if (p.type === 'inductor' && current >= 0.001) {
      active[p.id] = true
    }
  })

  return { nodeVoltage, branchCurrent, partVoltage, active, blownFuses, errors }
}
