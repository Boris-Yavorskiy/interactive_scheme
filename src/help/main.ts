import type { Lang } from '../types'
import { renderNav } from '../lib/nav.js'
import { getLang } from '../lib/lang.js'

interface Section {
  title: string
  items: string[]
}

interface HelpTexts {
  pageTitle: string
  lead: string
  sections: Section[]
}

const TEXTS: Record<Lang, HelpTexts> = {
  uk: {
    pageTitle: 'Довідка',
    lead: 'Короткий посібник зі збирання схем у конструкторі.',
    sections: [
      {
        title: 'Додавання компонентів',
        items: [
          'Перетягніть компонент зі списку ліворуч на полотно або просто клацніть по ньому.',
          'Щоб перемістити компонент, затисніть його лівою кнопкою миші й тягніть.',
          'Виділений компонент отримує рамку, а його властивості з\'являються в панелі праворуч.'
        ]
      },
      {
        title: "З'єднання",
        items: [
          'Затисніть кнопку миші на круглому терміналі компонента й протягніть лінію до терміналу іншого компонента.',
          'Або додайте «Провід» зі списку: у нього два кільця. Перетягніть кожне кільце до терміналу, і воно «прилипне».',
          'Подвійний клік по кільцю проводу відключає його від терміналу.',
          "Подвійний клік по прямій лінії з'єднання видаляє її.",
          'До одного терміналу можна підключити кілька проводів, так елементи вмикаються паралельно.'
        ]
      },
      {
        title: 'Керування компонентами',
        items: [
          'Вимикач: клацніть по корпусу, щоб замкнути або розімкнути коло.',
          'Кнопка: коло замкнене лише доки ви утримуєте кнопку миші.',
          'Батарея: напругу від 1 до 24 В задайте повзунком у панелі властивостей.',
          'Резистор: оберіть опір із шести значень. Реостат: змінюйте опір повзунком від 0 до 500 Ом.',
          'У панелі властивостей є кнопки «Повернути» та «Видалити компонент». Видалити виділений елемент можна й клавішею Delete.',
          'Кнопка «Очистити полотно» прибирає всю схему.'
        ]
      },
      {
        title: 'Прилади',
        items: [
          'Амперметр вмикають послідовно, у розрив кола.',
          'Вольтметр вмикають паралельно, до двох виводів елемента, на якому вимірюють напругу.',
          'Показання з\'являються на корпусі приладу.'
        ]
      },
      {
        title: 'Корисно знати',
        items: [
          'Світлодіод і діод пропускають струм в один бік: анод (a) до «+», катод (b) до «−».',
          'Лампа світиться від 0,05 А, світлодіод від 0,01 А, зуммер звучить від 0,03 А, двигун обертається від 0,08 А.',
          'Запобіжник перегорає при струмі понад 1,5 А. Щоб замінити його, видаліть деталь і додайте нову.',
          'Конденсатор накопичує заряд і не пропускає постійний струм: лампа, увімкнена з ним послідовно, не світитиметься.',
          'Котушка індуктивності при струмі показує магнітне поле та видає тихий звук.'
        ]
      },
      {
        title: 'Збереження схем',
        items: [
          'Щоб зберегти схему, увійдіть або зареєструйтесь за допомогою кнопки акаунта вгорі праворуч.',
          'Натисніть «Зберегти схему» та введіть назву. Повторне збереження оновлює ту саму схему.',
          'У меню акаунта відкрийте «Мої схеми», щоб завантажити або видалити збережене.'
        ]
      }
    ]
  },
  en: {
    pageTitle: 'Help',
    lead: 'A short guide to building circuits in the builder.',
    sections: [
      {
        title: 'Adding components',
        items: [
          'Drag a component from the list on the left onto the canvas, or just click it.',
          'To move a component, press it with the left mouse button and drag.',
          'The selected component gets a frame, and its properties appear in the panel on the right.'
        ]
      },
      {
        title: 'Connecting',
        items: [
          'Press the mouse button on a round terminal of a component and drag a line to a terminal of another component.',
          'Or add a "Wire" from the list: it has two rings. Drag each ring to a terminal and it snaps on.',
          'Double-click a wire ring to detach it from the terminal.',
          'Double-click a straight connection line to remove it.',
          'Several wires can be attached to one terminal, which is how elements are connected in parallel.'
        ]
      },
      {
        title: 'Controlling components',
        items: [
          'Switch: click the body to close or open the circuit.',
          'Button: the circuit is closed only while you hold the mouse button.',
          'Battery: set the voltage from 1 to 24 V with the slider in the properties panel.',
          'Resistor: choose a resistance from six values. Rheostat: change the resistance with the slider from 0 to 500 Ω.',
          'The properties panel has "Rotate" and "Delete component" buttons. A selected element can also be deleted with the Delete key.',
          'The "Clear canvas" button removes the whole scheme.'
        ]
      },
      {
        title: 'Meters',
        items: [
          'An ammeter is connected in series, in a break of the circuit.',
          'A voltmeter is connected in parallel, across the two leads of the element being measured.',
          'The readings appear on the body of the meter.'
        ]
      },
      {
        title: 'Good to know',
        items: [
          'An LED and a diode pass current in one direction only: anode (a) to "+", cathode (b) to "−".',
          'The lamp lights up from 0.05 A, the LED from 0.01 A, the buzzer sounds from 0.03 A and the motor spins from 0.08 A.',
          'A fuse blows at a current above 1.5 A. To replace it, delete the part and add a new one.',
          'A capacitor stores charge and blocks direct current: a lamp connected in series with it will not light.',
          'An inductor shows a magnetic field and makes a quiet sound when current flows.'
        ]
      },
      {
        title: 'Saving schemes',
        items: [
          'To save a scheme, log in or register with the account button in the top right corner.',
          'Press "Save scheme" and enter a name. Saving again updates the same scheme.',
          'Open "My schemes" in the account menu to load or delete saved work.'
        ]
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
  texts.sections.forEach(section => {
    html += '<div class="help-section"><h2>' + section.title + '</h2><ul>'
    section.items.forEach(item => {
      html += '<li>' + item + '</li>'
    })
    html += '</ul></div>'
  })

  page.innerHTML = html
  document.title = texts.pageTitle
  document.documentElement.lang = lang
}

function onLangChange(newLang: Lang) {
  lang = newLang
  render()
}

function start() {
  renderNav('help', onLangChange)
  render()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
