import type { Lang } from '../types'
import { renderNav } from '../lib/nav.js'
import { cacheDom, state } from './state.js'
import { applyStaticTexts, renderPalette, renderAll, renderPropsPanel } from './render.js'
import { bindEvents } from './interaction.js'
import { bindAuthUI, refreshAuth, updateAccountLabel } from './modals.js'

function onLangChange(lang: Lang) {
  state.lang = lang
  applyStaticTexts()
  renderPalette()
  renderPropsPanel()
  updateAccountLabel()
}

function start() {
  cacheDom()
  renderNav('builder', onLangChange)
  applyStaticTexts()
  renderPalette()
  bindEvents()
  bindAuthUI()
  renderAll()
  updateAccountLabel()
  refreshAuth()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
