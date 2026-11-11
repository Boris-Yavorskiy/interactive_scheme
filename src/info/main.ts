import type { Lang } from '../types'
import { renderNav } from '../lib/nav.js'
import { getLang } from '../lib/lang.js'
import { iconPath } from '../lib/components-data.js'
import { INFO, ICON_KEYS } from './data.js'

const COUNT = 15
const COLUMN_WIDTH = 360
const DOT_X = 72
const AMPLITUDE = 26
const PERIOD = 130
const ICON_SIZE = 148
const RADIUS = Math.round(ICON_SIZE / 2) + 14
const ICON_LEFT = DOT_X + 18
const START_Y = 140
const STEP_Y = 260

let lang: Lang = getLang()
let activeIndex = 0

function byId(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement
}

function setNavHeight() {
  const nav = byId('sb-navbar')
  document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px')
}

function renderTexts() {
  const texts = INFO[lang]
  byId('info-title').textContent = texts.title
  byId('info-intro1').textContent = texts.intro1
  byId('info-intro2').textContent = texts.intro2
  document.title = texts.title
  document.documentElement.lang = lang
}

function updateDots() {
  document.querySelectorAll('.info-dot').forEach((dot, index) => {
    const active = index === activeIndex
    dot.setAttribute('fill', active ? '#d4a843' : '#3a3228')
    dot.setAttribute('r', active ? '11' : '8')
  })
}

function showPanel(index: number) {
  const texts = INFO[lang]
  const item = texts.items[index]
  activeIndex = index

  byId('info-num').textContent = String(index + 1).padStart(2, '0') + ' / ' + COUNT
  byId('info-name').textContent = item.name
  byId('info-label1').textContent = texts.label1
  byId('info-label2').textContent = texts.label2
  byId('info-label3').textContent = texts.label3
  byId('info-history').textContent = item.history
  byId('info-how').textContent = item.how

  const image = byId('info-img') as HTMLImageElement
  image.src = iconPath(ICON_KEYS[index])
  image.alt = item.name

  const list = byId('info-facts')
  list.innerHTML = ''
  item.facts.forEach(fact => {
    const li = document.createElement('li')
    li.textContent = fact
    list.appendChild(li)
  })

  byId('info-panel').classList.add('open')
  updateDots()
}

function closePanel() {
  byId('info-panel').classList.remove('open')
}

function buildWire() {
  const column = byId('info-wire')
  const totalHeight = START_Y + STEP_Y * (COUNT - 1) + RADIUS + 20

  column.style.height = totalHeight + 'px'
  const wrap = document.querySelector<HTMLElement>('.info-wrap')
  if (wrap) wrap.style.minHeight = totalHeight + 'px'

  const redPoints: string[] = []
  const bluePoints: string[] = []
  for (let y = 0; y <= totalHeight; y += 2) {
    const offset = AMPLITUDE * Math.sin((2 * Math.PI * y) / PERIOD)
    redPoints.push((DOT_X + offset).toFixed(1) + ',' + y)
    bluePoints.push((DOT_X - offset).toFixed(1) + ',' + y)
  }

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + COLUMN_WIDTH + '" height="' + totalHeight + '" viewBox="0 0 ' + COLUMN_WIDTH + ' ' + totalHeight + '" style="position:absolute;left:0;top:0;display:block;pointer-events:none">'
  svg += '<path d="M' + bluePoints.join(' L') + '" stroke="#2c5fa8" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.88"/>'
  svg += '<path d="M' + redPoints.join(' L') + '" stroke="#c43535" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.88"/>'
  for (let i = 0; i < COUNT; i++) {
    const active = i === activeIndex
    svg += '<circle class="info-dot" cx="' + DOT_X + '" cy="' + (START_Y + i * STEP_Y) + '" r="' + (active ? 11 : 8) + '" fill="' + (active ? '#d4a843' : '#3a3228') + '" stroke="#fdf8ee" stroke-width="3"/>'
  }
  svg += '</svg>'

  column.innerHTML = svg

  for (let i = 0; i < COUNT; i++) {
    const centerY = START_Y + i * STEP_Y
    const centerX = ICON_LEFT + ICON_SIZE / 2

    const node = document.createElement('div')
    node.className = 'cnode'
    node.style.left = centerX - RADIUS + 'px'
    node.style.top = centerY - RADIUS + 'px'
    node.style.width = RADIUS * 2 + 'px'
    node.style.height = RADIUS * 2 + 'px'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    node.setAttribute('aria-label', INFO[lang].items[i].name)

    const image = document.createElement('img')
    image.src = iconPath(ICON_KEYS[i])
    image.alt = ''
    image.style.width = ICON_SIZE + 'px'
    image.style.height = ICON_SIZE + 'px'
    node.appendChild(image)

    const open = () => {
      node.classList.remove('pop')
      void node.offsetWidth
      node.classList.add('pop')
      window.setTimeout(() => node.classList.remove('pop'), 400)
      showPanel(i)
    }
    node.addEventListener('click', open)
    node.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        open()
      }
    })

    column.appendChild(node)
  }
}

function onLangChange(newLang: Lang) {
  lang = newLang
  renderTexts()
  buildWire()
  setNavHeight()
  if (byId('info-panel').classList.contains('open')) showPanel(activeIndex)
}

function start() {
  renderNav('info', onLangChange)
  setNavHeight()
  renderTexts()
  buildWire()

  byId('info-close').addEventListener('click', closePanel)
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePanel()
  })
  window.addEventListener('resize', setNavHeight)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
