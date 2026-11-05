import { api } from '../lib/api.js'
import type { ApiResponse } from '../lib/api.js'
import { state, els, t, showToast } from './state.js'
import { serializeScheme, loadSchemeData } from './actions.js'

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function errorText(response: ApiResponse): string {
  if (response.code) {
    const key = 'err_' + response.code
    const text = t(key)
    if (text !== key) return text
    if (response.code === 'network') return t('networkError')
  }
  return response.message || t('networkError')
}

export function updateAccountLabel() {
  els.accountLabel.textContent = state.isLoggedIn ? state.userEmail : t('guest')
}

export async function refreshAuth() {
  const response = await api('GET', '/auth/me')
  state.isLoggedIn = response.loggedIn === true
  state.userEmail = response.email || ''
  updateAccountLabel()
}

export function closeAuthModal() {
  els.authModal.classList.remove('open')
  els.authModal.innerHTML = ''
}

export function closeSchemesModal() {
  els.schemesModal.classList.remove('open')
  els.schemesModal.innerHTML = ''
}

async function submitAuth(mode: string) {
  const emailInput = document.getElementById('sb-auth-email') as HTMLInputElement
  const passwordInput = document.getElementById('sb-auth-password') as HTMLInputElement
  const errorBox = document.getElementById('sb-auth-error') as HTMLElement
  errorBox.textContent = ''

  const response = await api('POST', '/auth/' + mode, {
    email: emailInput.value.trim(),
    password: passwordInput.value
  })

  if (!response.success || !response.user) {
    errorBox.textContent = errorText(response)
    return
  }

  state.isLoggedIn = true
  state.userEmail = response.user.email
  updateAccountLabel()
  closeAuthModal()
}

export function openAuthModal(defaultTab: string = 'login') {
  let currentTab = defaultTab

  let html = '<div class="sb-modal-card sb-auth-card">'
  html += '<button class="sb-modal-close" id="sb-auth-close">&times;</button>'
  html += '<div class="sb-auth-tabs">'
  html += '<button class="sb-auth-tab' + (defaultTab === 'login' ? ' sb-auth-tab-active' : '') + '" data-tab="login">' + t('loginBtn') + '</button>'
  html += '<button class="sb-auth-tab' + (defaultTab === 'register' ? ' sb-auth-tab-active' : '') + '" data-tab="register">' + t('registerBtn') + '</button>'
  html += '</div>'
  html += '<div class="sb-auth-subtitle" id="sb-auth-subtitle">' + (defaultTab === 'login' ? t('loginSubtitle') : t('registerSubtitle')) + '</div>'
  html += '<input type="email" id="sb-auth-email" placeholder="' + t('email') + '" class="sb-input" autocomplete="email">'
  html += '<input type="password" id="sb-auth-password" placeholder="' + t('password') + '" class="sb-input" autocomplete="' + (defaultTab === 'login' ? 'current-password' : 'new-password') + '">'
  html += '<div class="sb-auth-error" id="sb-auth-error"></div>'
  html += '<button id="sb-auth-submit" class="sb-btn-primary sb-btn-full">' + (defaultTab === 'login' ? t('loginBtn') : t('registerBtn')) + '</button>'
  html += '</div>'

  els.authModal.innerHTML = html
  els.authModal.classList.add('open')

  const closeButton = document.getElementById('sb-auth-close') as HTMLElement
  closeButton.addEventListener('click', closeAuthModal)

  const tabs = els.authModal.querySelectorAll<HTMLElement>('.sb-auth-tab')
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab || 'login'
      tabs.forEach(other => other.classList.toggle('sb-auth-tab-active', other === tab))

      const subtitle = document.getElementById('sb-auth-subtitle') as HTMLElement
      const submit = document.getElementById('sb-auth-submit') as HTMLElement
      const password = document.getElementById('sb-auth-password') as HTMLInputElement
      const errorBox = document.getElementById('sb-auth-error') as HTMLElement

      subtitle.textContent = currentTab === 'login' ? t('loginSubtitle') : t('registerSubtitle')
      submit.textContent = currentTab === 'login' ? t('loginBtn') : t('registerBtn')
      password.autocomplete = currentTab === 'login' ? 'current-password' : 'new-password'
      errorBox.textContent = ''
    })
  })

  const submitButton = document.getElementById('sb-auth-submit') as HTMLElement
  submitButton.addEventListener('click', () => submitAuth(currentTab))

  const inputs = [
    document.getElementById('sb-auth-email') as HTMLInputElement,
    document.getElementById('sb-auth-password') as HTMLInputElement
  ]
  inputs.forEach(input => {
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') submitAuth(currentTab)
    })
  })

  window.setTimeout(() => inputs[0].focus(), 50)
}

function schemeCardHtml(id: number, title: string, updatedAt: string): string {
  const locale = state.lang === 'uk' ? 'uk-UA' : 'en-GB'
  const date = updatedAt ? new Date(updatedAt).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  let html = '<div class="sb-scheme-card">'
  html += '<div class="sb-scheme-card-icon">'
  html += '<svg width="28" height="28" viewBox="0 0 24 24" fill="none">'
  html += '<circle cx="5" cy="12" r="2.5" stroke="var(--sb-accent)" stroke-width="1.5"/>'
  html += '<circle cx="19" cy="7" r="2.5" stroke="var(--sb-accent)" stroke-width="1.5"/>'
  html += '<circle cx="19" cy="17" r="2.5" stroke="var(--sb-accent)" stroke-width="1.5"/>'
  html += '<line x1="7.5" y1="10.8" x2="16.5" y2="8.2" stroke="var(--sb-accent2)" stroke-width="1.2"/>'
  html += '<line x1="7.5" y1="13.2" x2="16.5" y2="15.8" stroke="var(--sb-accent2)" stroke-width="1.2"/>'
  html += '</svg></div>'
  html += '<div class="sb-scheme-card-body">'
  html += '<div class="sb-scheme-card-name">' + escapeHtml(title) + '</div>'
  if (date) html += '<div class="sb-scheme-card-date">' + date + '</div>'
  html += '</div>'
  html += '<div class="sb-scheme-card-actions">'
  html += '<button class="sb-scheme-open" data-id="' + id + '">' + t('loadBtn') + '</button>'
  html += '<button class="sb-scheme-delete" data-id="' + id + '">&#128465;</button>'
  html += '</div></div>'
  return html
}

export async function openSchemesModal() {
  const response = await api('GET', '/schemes')
  const schemes = response.schemes || []

  let html = '<div class="sb-modal-card sb-schemes-card">'
  html += '<button class="sb-modal-close" id="sb-schemes-close">&times;</button>'
  html += '<div class="sb-modal-title">'
  html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;margin-right:8px;opacity:0.7">'
  html += '<path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
  html += '</svg>' + t('mySchemes') + '</div>'

  if (!response.success || schemes.length === 0) {
    html += '<div class="sb-schemes-empty">'
    html += '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="opacity:0.25;margin-bottom:12px">'
    html += '<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>'
    html += '<path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
    html += '</svg>'
    html += '<p>' + t('noSchemes') + '</p></div>'
  } else {
    html += '<div class="sb-scheme-grid">'
    schemes.forEach(scheme => {
      html += schemeCardHtml(scheme.id, scheme.title, scheme.updatedAt)
    })
    html += '</div>'
  }
  html += '</div>'

  els.schemesModal.innerHTML = html
  els.schemesModal.classList.add('open')

  const closeButton = document.getElementById('sb-schemes-close') as HTMLElement
  closeButton.addEventListener('click', closeSchemesModal)

  els.schemesModal.querySelectorAll<HTMLElement>('.sb-scheme-open').forEach(button => {
    button.addEventListener('click', async () => {
      const reply = await api('GET', '/schemes/' + button.dataset.id)
      if (reply.success && reply.scheme) {
        state.currentSchemeId = reply.scheme.id
        state.currentSchemeTitle = reply.scheme.title
        loadSchemeData(reply.scheme.data)
        closeSchemesModal()
      }
    })
  })

  els.schemesModal.querySelectorAll<HTMLElement>('.sb-scheme-delete').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm(t('deleteConfirm'))) return
      const id = Number(button.dataset.id)
      await api('DELETE', '/schemes/' + id)
      if (state.currentSchemeId === id) state.currentSchemeId = null
      openSchemesModal()
    })
  })
}

export async function saveCurrentScheme() {
  if (!state.isLoggedIn) {
    showToast(t('needLogin'))
    openAuthModal()
    return
  }

  if (state.currentSchemeId) {
    const response = await api('PUT', '/schemes/' + state.currentSchemeId, {
      title: state.currentSchemeTitle,
      data: serializeScheme()
    })
    if (response.success) showToast(t('saved'))
    return
  }

  const name = prompt(t('schemeNamePrompt'), state.currentSchemeTitle)
  if (name === null) return

  state.currentSchemeTitle = name || t('untitled')
  const response = await api('POST', '/schemes', {
    title: state.currentSchemeTitle,
    data: serializeScheme()
  })
  if (response.success && response.id) {
    state.currentSchemeId = response.id
    showToast(t('saved'))
  }
}

function toggleAccountMenu() {
  els.accountMenu.classList.toggle('open')
  if (!els.accountMenu.classList.contains('open')) return

  els.accountMenu.innerHTML =
    '<button id="sb-menu-myschemes">' + t('mySchemes') + '</button>' +
    '<button id="sb-menu-logout">' + t('logoutBtn') + '</button>'

  const mySchemes = document.getElementById('sb-menu-myschemes') as HTMLElement
  mySchemes.addEventListener('click', () => {
    els.accountMenu.classList.remove('open')
    openSchemesModal()
  })

  const logout = document.getElementById('sb-menu-logout') as HTMLElement
  logout.addEventListener('click', async () => {
    els.accountMenu.classList.remove('open')
    await api('POST', '/auth/logout')
    state.isLoggedIn = false
    state.userEmail = ''
    state.currentSchemeId = null
    updateAccountLabel()
  })
}

export function bindAuthUI() {
  els.accountBtn.addEventListener('click', event => {
    event.stopPropagation()
    if (state.isLoggedIn) toggleAccountMenu()
    else openAuthModal()
  })

  document.addEventListener('click', () => {
    els.accountMenu.classList.remove('open')
  })
}
