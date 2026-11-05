import type { Lang } from '../types'
import { translate } from './i18n.js'
import { getLang, saveLang } from './lang.js'

export type PageName = 'home' | 'builder' | 'info' | 'help'

const ICONS: Record<PageName, string> = {
  home: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  builder: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/><path d="M7 12h10M12 7v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v1M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  help: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 16.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
}

const LINKS: { page: PageName; href: string; key: string }[] = [
  { page: 'home', href: '/', key: 'navHome' },
  { page: 'builder', href: '/builder', key: 'navBuilder' },
  { page: 'info', href: '/info', key: 'navInfo' },
  { page: 'help', href: '/help', key: 'navHelp' }
]

export function renderNav(active: PageName, onChange: (lang: Lang) => void) {
  const nav = document.getElementById('sb-navbar')
  if (!nav) return

  function draw() {
    const lang = getLang()
    let html = ''

    LINKS.forEach(link => {
      const cls = link.page === active ? 'sb-nav-link sb-nav-active' : 'sb-nav-link'
      html += '<a class="' + cls + '" href="' + link.href + '">' + ICONS[link.page] + translate(lang, link.key) + '</a>'
    })

    html += '<div class="sb-lang">'
    html += '<button data-lang="uk" class="' + (lang === 'uk' ? 'sb-lang-on' : '') + '">УКР</button>'
    html += '<button data-lang="en" class="' + (lang === 'en' ? 'sb-lang-on' : '') + '">ENG</button>'
    html += '</div>'

    nav!.innerHTML = html

    nav!.querySelectorAll<HTMLButtonElement>('.sb-lang button').forEach(button => {
      button.addEventListener('click', () => {
        const newLang: Lang = button.dataset.lang === 'en' ? 'en' : 'uk'
        saveLang(newLang)
        draw()
        onChange(newLang)
      })
    })
  }

  draw()
}
