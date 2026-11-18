import type { Lang } from '../types'
import { renderNav } from '../lib/nav.js'
import { getLang } from '../lib/lang.js'

interface Card {
  title: string
  text: string
}

interface HomeTexts {
  pageTitle: string
  lead: string
  openBuilder: string
  openInfo: string
  cards: Card[]
}

const TEXTS: Record<Lang, HomeTexts> = {
  uk: {
    pageTitle: 'Інтерактивний конструктор електричних схем',
    lead: 'Збирайте електричні кола з реальних компонентів і одразу бачте, як вони працюють: лампа світиться, двигун обертається, а прилади показують струм і напругу.',
    openBuilder: 'Відкрити конструктор',
    openInfo: 'Про компоненти',
    cards: [
      {
        title: '16 компонентів',
        text: 'Батарея, лампа, вимикач, кнопка, резистор, реостат, амперметр, вольтметр, світлодіод, діод, двигун, зуммер, запобіжник, конденсатор, котушка індуктивності та провід.'
      },
      {
        title: 'Фізична симуляція',
        text: "Схема розраховується за законами Ома та Кірхгофа: послідовне й паралельне з'єднання, полярність діодів, перегорання запобіжника."
      },
      {
        title: 'Збереження схем',
        text: 'Зареєструйтесь, щоб зберігати власні схеми та повертатися до них з будь-якого пристрою.'
      },
      {
        title: 'Довідкова інформація',
        text: 'Історія винаходу, принцип дії та цікаві факти про кожен компонент.'
      }
    ]
  },
  en: {
    pageTitle: 'Interactive Electric Circuit Builder',
    lead: 'Build electric circuits from real components and instantly see how they work: the lamp lights up, the motor spins, and the meters show current and voltage.',
    openBuilder: 'Open the builder',
    openInfo: 'About the components',
    cards: [
      {
        title: '16 components',
        text: 'Battery, lamp, switch, button, resistor, rheostat, ammeter, voltmeter, LED, diode, motor, buzzer, fuse, capacitor, inductor and wire.'
      },
      {
        title: 'Physical simulation',
        text: 'The circuit is calculated with Ohm\'s and Kirchhoff\'s laws: series and parallel connections, diode polarity, a fuse that blows.'
      },
      {
        title: 'Saving schemes',
        text: 'Register to save your own schemes and come back to them from any device.'
      },
      {
        title: 'Reference information',
        text: 'The history of the invention, the principle of operation and interesting facts about every component.'
      }
    ]
  }
}

let lang: Lang = getLang()

function render() {
  const texts = TEXTS[lang]
  const page = document.getElementById('page') as HTMLElement

  let html = '<h1>' + texts.pageTitle + '</h1>'
  html += '<p class="page-lead">' + texts.lead + '</p>'
  html += '<div class="page-buttons">'
  html += '<a class="page-button page-button-main" href="/builder">' + texts.openBuilder + '</a>'
  html += '<a class="page-button" href="/info">' + texts.openInfo + '</a>'
  html += '</div>'
  html += '<div class="page-cards">'
  texts.cards.forEach(card => {
    html += '<div class="page-card"><h3>' + card.title + '</h3><p>' + card.text + '</p></div>'
  })
  html += '</div>'

  page.innerHTML = html
  document.title = texts.pageTitle
  document.documentElement.lang = lang
}

function onLangChange(newLang: Lang) {
  lang = newLang
  render()
}

function start() {
  renderNav('home', onLangChange)
  render()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
