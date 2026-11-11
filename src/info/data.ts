export interface InfoItem {
  name: string
  history: string
  how: string
  facts: string[]
}

export interface InfoTexts {
  title: string
  intro1: string
  intro2: string
  label1: string
  label2: string
  label3: string
  items: InfoItem[]
}

export const ICON_KEYS = [
  'battery', 'wire', 'lamp', 'switch', 'resistor', 'rheostat', 'ammeter', 'voltmeter',
  'led', 'diode', 'motor', 'buzzer', 'fuse', 'capacitor', 'inductor'
]

export const INFO: Record<'uk' | 'en', InfoTexts> = {
  uk: {
    title: "Електронні компоненти",
    intro1: "Основи електроніки",
    intro2: "Натисніть на компонент на проводі, щоб дізнатися більше.",
    label1: "Дата та місце винаходу",
    label2: "Що це та як працює",
    label3: "Цікаві факти",
    items: [
      {
        name: "Батарея",
        history: "Перша хімічна батарея — «вольтів стовп» — створена Алессандро Вольта у 1800 р. в Павії, Італія. Вчений поклав мідні та цинкові диски, розділені сукном із соляним розчином, і отримав перший стабільний електричний струм.",
        how: "Батарея перетворює хімічну енергію на електричну завдяки окислювально-відновним реакціям між двома різними металами (електродами), зануреними в електроліт. Різниця електрохімічних потенціалів між анодом і катодом утворює напругу, яка рухає електрони крізь зовнішнє коло.",
        facts: [
          "Лужні батарейки AA типу подають від 1,5 В до майже нуля протягом кількох годин безперервної роботи залежно від навантаження.",
          "Найстаріша відома батарея — так звана «Багдадська» — датується приблизно 250 р. до н.е.; деякі вчені вважають її гальванічним елементом, хоча її справжнє призначення ще не встановлено."
        ]
      },
      {
        name: "Провід",
        history: "Мідні проводи набули масового поширення після запровадження електричного телеграфу в 1840-х роках у Британії та США. Семюел Морзе використовував мідні та залізні жили для першої трансконтинентальної лінії зв'язку.",
        how: "Провід — це провідник, зазвичай із міді або алюмінію, покритий ізоляційним шаром, що передає електричний струм між компонентами кола. Електрони рухаються крізь кристалічну решітку металу під дією різниці потенціалів. Ізоляція запобігає витоку струму та короткому замиканню.",
        facts: [
          "Мідь — найпопулярніший матеріал для провідників: за електропровідністю вона поступається лише сріблу, але є набагато дешевшою.",
          "Якщо витягнути всі електричні проводи у середньому приватному будинку в одну лінію, вона складе від 1 до 2 кілометрів."
        ]
      },
      {
        name: "Лампа",
        history: "Практичну лампу розжарювання з вуглецевою ниткою створив Томас Едісон у 1879 р. в Менло-Парк (США). Паралельно та незалежно британець Джозеф Свон отримав аналогічний патент у тому ж році; пізніше вони заснували спільну компанію Ediswan.",
        how: "Лампа розжарювання перетворює електричний струм на світло та тепло. Струм проходить крізь тонку вольфрамову нитку, нагріваючи її до температури 2600–3000 °C. Розжарене тіло випромінює електромагнітні хвилі в діапазоні видимого світла відповідно до закону Планка. Колба заповнена інертним газом (аргон, криптон), що сповільнює випаровування вольфраму.",
        facts: [
          "Лампа розжарювання перетворює на видиме світло лише близько 5% спожитої електроенергії — решта розсіюється у вигляді тепла.",
          "Вольфрамова нитка тоншa за людську волосину (~40–50 мкм), але під час роботи вона розпечена приблизно до 2800 °C — це близько половини температури поверхні Сонця (~5500 °C)."
        ]
      },
      {
        name: "Вимикач",
        history: "Перші побутові електричні вимикачі з'явились у Лондоні в 1890-х роках одночасно з розвитком централізованих систем електропостачання. Ранні моделі були громіздкими рубильниками відкритого типу.",
        how: "Вимикач механічно розмикає або замикає електричне коло, контролюючи подачу струму до споживача. У замкненому стані металевий важіль або пластина фізично з'єднує два провідники, утворюючи низькоомний шлях для струму. У розімкненому стані — повітряний проміжок запобігає протіканню струму.",
        facts: [
          "Кожен вимикач має паспортний рейтинг максимального струму та напруги; перевищення цих значень може спричинити іскрення, дугу та займання проводки.",
          "Сенсорні вимикачі без рухомих механічних частин мають розрахунковий ресурс понад 1 000 000 комутаційних циклів — порівняно з ~50 000 у традиційних важільних моделей."
        ]
      },
      {
        name: "Резистор",
        history: "Перший вуглецевий резистор запатентований Генрі Кольтом у США в 1898 р. Стандарт кольорового маркування введений Міжнародною електротехнічною комісією (IEC) у 1952 р. і використовується дотепер.",
        how: "Резистор обмежує силу струму в електричному колі, підкоряючись закону Ома (U = I·R). При проходженні струму через резистивний матеріал кінетична енергія електронів частково перетворюється на теплову. Опір вимірюється в Омах (Ω) і залежить від матеріалу провідника, його довжини та площі поперечного перерізу.",
        facts: [
          "Кольорові смуги на корпусі резистора кодують його номінальний опір і допуск за міжнародним стандартом IEC 60062: перші дві смуги — цифри, третя — множник, четверта — допуск.",
          "Навіть звичайна нихромова нитка нагрівального елемента у тостері або фені є потужним резистором із робочою потужністю 750–2000 Вт."
        ]
      },
      {
        name: "Реостат",
        history: "Реостат із ковзним контактом розробив британський фізик Чарльз Вітстон приблизно у 1843 р. у Лондоні для точного вимірювання електричних величин. Назву «реостат» (від грец. «той, що регулює потік») ввів Вітстон у тому ж році.",
        how: "Реостат — це змінний резистор із рухомим ковзним контактом, що дозволяє плавно змінювати величину активного опору в колі від нуля до максимуму. Це змінює силу струму за законом Ома. Реостат підключають послідовно в коло і використовують для плавного регулювання яскравості ламп, швидкості двигунів і температури нагрівальних елементів.",
        facts: [
          "Перші електричні диммери для театральної сцени Вест-Енду у Лондоні в 1880-х роках були величезними водяними реостатами — оператори вручну занурювали електроди у воду для регулювання яскравості освітлення.",
          "Сьогодні реостати витіснили цифрові ШІМ-контролери (широтно-імпульсна модуляція), але аналогові реостати досі застосовують у лабораторіях та навчальних установах."
        ]
      },
      {
        name: "Амперметр",
        history: "Перший практичний амперметр на основі гальванометра з рухомою котушкою розробив французький фізик Жак-Арсен д'Арсонваль у Парижі в 1882 р. Прилад вимірював силу струму через відхилення стрілки в магнітному полі.",
        how: "Амперметр вимірює силу електричного струму в амперах (А). Прилад підключається послідовно в розрив кола, через яке вимірюється струм. Щоб мінімально впливати на вимірюване коло, амперметр повинен мати якомога менший внутрішній опір — в ідеалі нульовий. Стрілочні прилади використовують ефект сили Ампера; цифрові вимірюють падіння напруги на шунті.",
        facts: [
          "Ідеальний амперметр повинен мати нульовий внутрішній опір — на практиці виробники прагнуть до значень у мілліомах або навіть мікроомах для потужних схем.",
          "Сучасні цифрові мультиметри здатні вимірювати струм у діапазоні від 0,01 мкА до 10–20 А залежно від режиму вимірювання та конструкції шунта."
        ]
      },
      {
        name: "Вольтметр",
        history: "Перші прилади для вимірювання напруги (гальванометри з великим послідовним опором) з'явились у Лондоні в 1870-х роках у лабораторіях Вільяма Томсона — лорда Кельвіна. Він же запропонував термін «вольтметр» на честь Алессандро Вольта.",
        how: "Вольтметр вимірює різницю електричних потенціалів між двома точками кола (напругу) у вольтах (В). Прилад підключають паралельно до досліджуваної ділянки. Щоб не шунтувати коло та не спотворювати результат, вольтметр повинен мати якомога більший внутрішній опір — в ідеалі нескінченний.",
        facts: [
          "Ідеальний вольтметр має нескінченний внутрішній опір; сучасні цифрові моделі зазвичай мають вхідний опір від 10 МОм до 1 ГОм, що робить їх вплив на коло мізерним.",
          "Вольтметром із дуже великим вхідним опором можна вимірювати навіть напругу статичного заряду на поверхні пластику або скла — кілька сотень вольт без жодного струму."
        ]
      },
      {
        name: "Світлодіод (LED)",
        history: "Перший практичний видимий світлодіод (червоного кольору) створив американський фізик Нік Холоньяк-молодший у дослідницькому підрозділі General Electric (Сіракузи, США) у 1962 р. До цього існували лише інфрачервоні діоди.",
        how: "Світлодіод — напівпровідниковий p-n-перехід, у якому при прямому зміщенні рекомбінація електронів і дірок супроводжується випромінюванням фотонів. На відміну від лампи розжарювання, це холодне світіння (електролюмінесценція) — без нагріву. Колір (довжина хвилі фотонів) визначається шириною забороненої зони напівпровідникового матеріалу.",
        facts: [
          "Синій LED, розроблений Ісаму Акасакі, Хіросі Амано та Сюдзі Накамурою (Нобелівська премія з фізики 2014 р.), уможливив створення білих світлодіодів та повністю змінив сучасне освітлення.",
          "LED-лампа споживає у 8–10 разів менше електроенергії, ніж аналогічна лампа розжарювання, і служить у 25–50 разів довше."
        ]
      },
      {
        name: "Діод",
        history: "Вакуумний діод (двоелектродна лампа) винайшов британський фізик Джон Флемінг у Лондоні в 1904 р. для детектування радіосигналів. Перший напівпровідниковий p-n-діод отримав Рассел Ол у лабораторії Bell Labs (США) у 1940 р.",
        how: "Діод — напівпровідниковий прилад із p-n-переходом, що пропускає струм лише в одному напрямку: від анода (p-тип) до катода (n-тип). При прямому зміщенні потенційний бар'єр знижується і струм тече; при зворотному — бар'єр зростає і струм практично відсутній. Це робить діод ідеальним випрямлячем змінного струму.",
        facts: [
          "Пряме падіння напруги на кремнієвому p-n-діоді становить близько 0,6–0,7 В — це фізичний «поріг», нижче якого діод залишається закритим.",
          "Стабілітрон — спеціальний тип діода з точно контрольованою напругою пробою при зворотному зміщенні — є основним елементом більшості простих стабілізаторів напруги."
        ]
      },
      {
        name: "Електродвигун",
        history: "Перший прилад з обертальним рухом на основі електромагнітної індукції демонстрував Майкл Фарадей у Лондоні в 1821 р. Перший практичний двигун постійного струму для промислового застосування розробив бельгієць Зеноб Грамм у Парижі в 1873 р.",
        how: "Електродвигун перетворює електричну енергію на механічну, використовуючи взаємодію між магнітними полями. Струм, що протікає через обмотки ротора, породжує магнітне поле, яке взаємодіє з полем постійного магніта (статора), утворюючи момент сили, що обертає ротор. У двигунах змінного струму використовується принцип обертового магнітного поля.",
        facts: [
          "Електродвигуни споживають приблизно 45–50% усієї електроенергії, що виробляється у світі — від мікромоторів у годинниках до турбогенераторів електростанцій потужністю сотні МВт.",
          "Мікромотори для вібраційного оповіщення у смартфонах важать менше 1 грама, виконують 10 000–15 000 оборотів на хвилину і живуть мільйони циклів ввімкнення."
        ]
      },
      {
        name: "Зуммер",
        history: "Перший електромагнітний дзвінок (прямий попередник зуммера) продемонстрував американський фізик Джозеф Генрі приблизно у 1831 р. у США. П'єзоелектричний зуммер — японська розробка кінця 1960-х років компанії Murata Manufacturing.",
        how: "Зуммер генерує звуковий або тональний сигнал одним із двох способів. Електромагнітний тип використовує котушку індуктивності, що створює змінне магнітне поле, яке коливає металеву мембрану з частотою, чутною людському вуху. П'єзоелектричний тип використовує кристал (титанат барію або цирконат-титанат свинцю), що деформується під дією змінної напруги й видає звук.",
        facts: [
          "POST-сигнал (Power-On Self Test), який видає комп'ютер при увімкненні, — це звуковий код помилки, що генерується крихітним п'єзозуммером на материнській платі. Один короткий сигнал означає успішне завантаження.",
          "П'єзоелектричний ефект, на якому ґрунтується робота п'єзозуммера, відкрили брати П'єр і Жак Кюрі у 1880 р., досліджуючи кристали кварцу та турмаліну."
        ]
      },
      {
        name: "Запобіжник",
        history: "Плавкий запобіжник запатентований Томасом Едісоном у 1890 р. у США. Едісон описав його як «навмисно слабку ланку» в колі — елемент, що перегорає першим, захищаючи решту обладнання від руйнівного надструму.",
        how: "Запобіжник захищає електричне коло від надструму, спричиненого коротким замиканням або перевантаженням. Усередині запобіжника є тонка металева нитка з низькотемпературного сплаву. При перевищенні номінального струму нитка нагрівається, плавиться і розриває ланцюг, запобігаючи руйнуванню дорогого обладнання, займанню проводки або пожежі.",
        facts: [
          "Плавка нитка запобіжника зазвичай виготовляється з евтектичного сплаву олова та свинцю (температура плавлення ~183 °C) або з чистого срібла для прецизійних та швидкодіючих застосувань.",
          "Сучасні самовідновні запобіжники на основі PTC-термісторів (полімерного або керамічного) збільшують опір у тисячі разів при перегріві, а після охолодження повертаються у вихідний стан."
        ]
      },
      {
        name: "Конденсатор",
        history: "Перший конденсатор — «Лейденська банка» — незалежно та майже одночасно створили Евальд Юрген Георг фон Клейст у Камміні (1745) і Пітер ван Мушенбрук у Лейдені, Нідерланди (1746). Скляна банка із зовнішньою та внутрішньою обкладками зі станіолю накопичувала статичний заряд.",
        how: "Конденсатор накопичує електричний заряд між двома провідними пластинами (обкладками), розділеними діелектриком. При підключенні до джерела напруги на обкладках накопичуються рівні за величиною та протилежні за знаком заряди. Електрична ємність C = Q/U вимірюється у Фарадах (Ф) і залежить від площі обкладок, відстані між ними та діелектричної проникності матеріалу між ними.",
        facts: [
          "Суперконденсатори (ультракапаситори) можуть мати ємність у тисячі Фарад і використовуються в гібридних та електричних автомобілях для рекуперативного гальмування та миттєвої подачі потужності при старті.",
          "Конденсатор у фотографічному спалаху заряджається кілька секунд, а потім за мілісекунди (~1 мс) віддає до 100 Дж енергії — це потужність порядку 100 кВт у момент спалаху."
        ]
      },
      {
        name: "Котушка індуктивності",
        history: "Явище електромагнітної індукції відкрив Майкл Фарадей у Лондоні в 1831 р., після чого котушки почали широко застосовуватись у телеграфних пристроях. Перші промислові трансформатори з котушками розробили Ціпернавський, Блаті та Дері у Будапешті в 1885 р.",
        how: "Котушка індуктивності — провідник, намотаний у вигляді спіралі, що накопичує енергію в магнітному полі при протіканні струму. Індуктивність L (Генрі) визначає, наскільки сильно котушка протидіє змінам струму. Реактивний опір XL = 2πfL зростає пропорційно частоті, тому котушки використовують у фільтрах і резонансних контурах для блокування або пропускання певних частот.",
        facts: [
          "Трансформатор — це, по суті, дві або більше індуктивних котушок із спільним феромагнітним сердечником; передача енергії між ними відбувається через змінне магнітне поле без гальванічного контакту.",
          "Стандарт бездротового заряджання Qi, що використовується у смартфонах, передає енергію між двома індуктивними котушками через повітряний зазор за допомогою електромагнітної індукції на частоті 100–205 кГц."
        ]
      }
    ]
  },
  en: {
    title: "Electronic Components",
    intro1: "Fundamentals of Electronics",
    intro2: "Click a component on the wire to learn more.",
    label1: "Date & place of invention",
    label2: "What it is & how it works",
    label3: "Interesting facts",
    items: [
      {
        name: "Battery",
        history: "The first chemical battery — the voltaic pile — was created by Alessandro Volta in 1800 in Pavia, Italy. He stacked alternating copper and zinc discs separated by brine-soaked cloth, producing the first steady electric current.",
        how: "A battery converts chemical energy into electrical energy through redox reactions between two different metal electrodes immersed in an electrolyte. The difference in electrochemical potential between the anode and cathode creates a voltage that drives electrons through the external circuit.",
        facts: [
          "Alkaline AA batteries deliver voltage from 1.5 V down to nearly zero over several hours of continuous use depending on the load.",
          "The oldest known battery — the Baghdad Battery — dates to approximately 250 BC; its exact purpose is still debated among scientists."
        ]
      },
      {
        name: "Wire",
        history: "Copper wires became widespread with the introduction of the electric telegraph in the 1840s in Britain and the USA. Samuel Morse used copper and iron strands for the first transcontinental communication line.",
        how: "A wire is a conductor, usually copper or aluminium in an insulating sheath, that carries electric current between circuit components. Electrons move through the metal's crystal lattice driven by a potential difference. Insulation prevents current leakage and short circuits.",
        facts: [
          "Copper is the most popular conductor material: it has the second-lowest resistivity of all pure metals, surpassed only by silver, but at a fraction of the cost.",
          "If you unravelled all the electrical wiring in an average house into a single line, it would stretch 1 to 2 kilometres."
        ]
      },
      {
        name: "Lamp",
        history: "A practical incandescent lamp with a carbon filament was created by Thomas Edison in 1879 in Menlo Park, USA. Independently and in parallel, Briton Joseph Swan obtained a similar patent in the same year; they later founded the joint company Ediswan.",
        how: "An incandescent lamp converts electric current into light and heat. Current passes through a thin tungsten filament, heating it to 2600–3000 °C. The incandescent body radiates electromagnetic waves in the visible light range according to Planck's law. The bulb is filled with an inert gas (argon, krypton) to slow tungsten evaporation.",
        facts: [
          "An incandescent bulb converts only about 5% of consumed electrical energy into visible light — the rest is dissipated as heat.",
          "The tungsten filament is thinner than a human hair (~40–50 µm), yet during operation it is heated to about 2800 °C — roughly half the temperature of the surface of the Sun (~5500 °C)."
        ]
      },
      {
        name: "Switch",
        history: "The first domestic electric switches appeared in London in the 1890s alongside the development of centralised electricity supply systems. Early models were bulky open-frame knife switches.",
        how: "A switch mechanically opens or closes an electrical circuit, controlling current flow to a load. In the closed position a metal lever or plate physically connects two conductors, creating a low-resistance path for current. In the open position an air gap prevents current from flowing.",
        facts: [
          "Every switch has a rated maximum current and voltage; exceeding these values can cause arcing, electric arcs and wiring fires.",
          "Touch switches with no moving mechanical parts have a design life exceeding 1,000,000 switching cycles — compared to ~50,000 for traditional toggle models."
        ]
      },
      {
        name: "Resistor",
        history: "The first carbon resistor was patented by Henry Colt in the USA in 1898. The colour-coding standard was introduced by the International Electrotechnical Commission (IEC) in 1952 and is still in use today.",
        how: "A resistor limits the current in an electrical circuit, obeying Ohm's Law (U = I·R). As current passes through a resistive material, some of the electrons' kinetic energy is converted to heat. Resistance is measured in Ohms (Ω) and depends on the material, its length and its cross-sectional area.",
        facts: [
          "The colour bands on a resistor body encode its nominal resistance and tolerance per IEC 60062: the first two bands are digits, the third is the multiplier, and the fourth is the tolerance.",
          "Even the ordinary nichrome heating element wire in a toaster or hair dryer is a powerful resistor with an operating power of 750–2000 W."
        ]
      },
      {
        name: "Rheostat",
        history: "The sliding-contact rheostat was developed by British physicist Charles Wheatstone around 1843 in London for precise electrical measurement. Wheatstone himself coined the name 'rheostat' (from Greek: 'one that regulates flow').",
        how: "A rheostat is a variable resistor with a movable sliding contact that allows smooth adjustment of the resistance in a circuit from zero to maximum, thereby changing the current per Ohm's Law. It is connected in series and used to smoothly control lamp brightness, motor speed and heater temperature.",
        facts: [
          "The first electric dimmers for the West End theatre stage in London in the 1880s were enormous water rheostats — operators manually immersed electrodes in water to adjust lighting brightness.",
          "Today rheostats have largely been replaced by digital PWM controllers (pulse-width modulation), but analogue rheostats are still used in laboratories and educational institutions."
        ]
      },
      {
        name: "Ammeter",
        history: "The first practical ammeter based on a moving-coil galvanometer was developed by French physicist Jacques-Arsène d'Arsonval in Paris in 1882. The instrument measured current strength by the deflection of a needle in a magnetic field.",
        how: "An ammeter measures the strength of electric current in amperes (A). It is connected in series in a break in the circuit being measured. To minimally affect the measured circuit, an ammeter must have as low an internal resistance as possible — ideally zero. Moving-coil instruments exploit the Ampere force effect; digital ones measure the voltage drop across a shunt.",
        facts: [
          "An ideal ammeter should have zero internal resistance — in practice manufacturers aim for values in milliohms or even microohms for high-power circuits.",
          "Modern digital multimeters can measure current over a range from 0.01 µA to 10–20 A depending on the measurement mode and shunt design."
        ]
      },
      {
        name: "Voltmeter",
        history: "The first instruments for measuring voltage (galvanometers with a large series resistance) appeared in London in the 1870s in the laboratory of William Thomson — Lord Kelvin. He also proposed the term 'voltmeter' in honour of Alessandro Volta.",
        how: "A voltmeter measures the difference in electric potential between two points in a circuit (voltage) in volts (V). It is connected in parallel with the section being tested. To avoid loading the circuit and distorting the result, a voltmeter must have as high an internal resistance as possible — ideally infinite.",
        facts: [
          "An ideal voltmeter has infinite internal resistance; modern digital models typically have an input resistance of 10 MΩ to 1 GΩ, making their effect on the circuit negligible.",
          "A voltmeter with very high input resistance can even measure the voltage of a static charge on the surface of plastic or glass — several hundred volts with essentially no current."
        ]
      },
      {
        name: "LED",
        history: "The first practical visible LED (red) was created by American physicist Nick Holonyak Jr. in the research division of General Electric (Syracuse, USA) in 1962. Prior to this, only infrared diodes existed.",
        how: "An LED is a semiconductor p-n junction in which the recombination of electrons and holes under forward bias is accompanied by the emission of photons. Unlike an incandescent lamp, this is cold light emission (electroluminescence) — with no heating. The colour (photon wavelength) is determined by the bandgap of the semiconductor material.",
        facts: [
          "The blue LED developed by Isamu Akasaki, Hiroshi Amano and Shuji Nakamura (Nobel Prize in Physics 2014) made white LEDs possible and completely transformed modern lighting.",
          "An LED lamp consumes 8–10 times less electricity than an equivalent incandescent bulb and lasts 25–50 times longer."
        ]
      },
      {
        name: "Diode",
        history: "The vacuum diode (two-electrode valve) was invented by British physicist John Fleming in London in 1904 for radio signal detection. The first semiconductor p-n diode was produced by Russell Ohl at Bell Labs (USA) in 1940.",
        how: "A diode is a semiconductor device with a p-n junction that allows current to flow in only one direction: from the anode (p-type) to the cathode (n-type). Under forward bias the potential barrier falls and current flows; under reverse bias the barrier rises and current is virtually absent. This makes the diode an ideal AC rectifier.",
        facts: [
          "The forward voltage drop across a silicon p-n diode is about 0.6–0.7 V — this is the physical 'threshold' below which the diode remains closed.",
          "The Zener diode — a special type with a precisely controlled reverse breakdown voltage — is the core element of most simple voltage regulators."
        ]
      },
      {
        name: "Electric Motor",
        history: "The first device with rotary motion based on electromagnetic induction was demonstrated by Michael Faraday in London in 1821. The first practical DC motor for industrial use was developed by Belgian inventor Zénobe Gramme in Paris in 1873.",
        how: "An electric motor converts electrical energy into mechanical energy using the interaction of magnetic fields. Current flowing through the rotor windings generates a magnetic field that interacts with the permanent magnet (stator) field, creating a torque that rotates the rotor. AC motors use the principle of a rotating magnetic field.",
        facts: [
          "Electric motors consume about 45–50% of all electricity generated worldwide — from micro-motors in watches to power-station turbogenerators rated at hundreds of MW.",
          "Vibration micro-motors in smartphones weigh less than 1 gram, spin at 10,000–15,000 RPM and survive millions of activation cycles."
        ]
      },
      {
        name: "Buzzer",
        history: "The first electromagnetic bell (the direct predecessor of the buzzer) was demonstrated by American physicist Joseph Henry around 1831 in the USA. The piezoelectric buzzer is a late-1960s Japanese invention by Murata Manufacturing.",
        how: "A buzzer generates an audible or tonal signal in one of two ways. The electromagnetic type uses an inductor coil that creates an alternating magnetic field, vibrating a metal diaphragm at a frequency audible to the human ear. The piezoelectric type uses a crystal (barium titanate or lead zirconate titanate) that deforms under an alternating voltage and produces sound.",
        facts: [
          "The POST beep (Power-On Self Test) emitted by a computer at startup is a fault code generated by a tiny piezo buzzer on the motherboard. One short beep means a successful boot.",
          "The piezoelectric effect underlying the piezo buzzer was discovered by brothers Pierre and Jacques Curie in 1880 while studying quartz and tourmaline crystals."
        ]
      },
      {
        name: "Fuse",
        history: "The fuse was patented by Thomas Edison in 1890 in the USA. Edison described it as the 'deliberately weak link' in a circuit — an element that burns out first, protecting the rest of the equipment from destructive overcurrent.",
        how: "A fuse protects an electrical circuit from overcurrent caused by a short circuit or overload. Inside the fuse is a thin wire of low-melting-point alloy. When the rated current is exceeded, the wire heats up, melts and breaks the circuit, preventing destruction of expensive equipment, wiring fires or a building fire.",
        facts: [
          "The fusible wire in a fuse is usually made of eutectic tin-lead alloy (melting point ~183 °C), or pure silver for precision and fast-blow applications.",
          "Modern self-resetting fuses based on PTC thermistors (polymer or ceramic) increase their resistance by thousands of times when overheated, then return to their original state after cooling."
        ]
      },
      {
        name: "Capacitor",
        history: "The first capacitor — the Leyden jar — was independently and almost simultaneously created by Ewald Jürgen Georg von Kleist in Cammin (1745) and Pieter van Musschenbroek in Leiden, Netherlands (1746). A glass jar with inner and outer tinfoil coatings accumulated static charge.",
        how: "A capacitor stores electric charge between two conductive plates (electrodes) separated by a dielectric. When connected to a voltage source, equal and opposite charges accumulate on the plates. Capacitance C = Q/U is measured in Farads (F) and depends on plate area, the distance between them and the permittivity of the dielectric material.",
        facts: [
          "Supercapacitors (ultracapacitors) can have capacitances of thousands of Farads and are used in hybrid and electric vehicles for regenerative braking and instantaneous power delivery at startup.",
          "The capacitor in a photographic flash charges over several seconds, then delivers up to 100 J in milliseconds (~1 ms) — a power level on the order of 100 kW at the moment of the flash."
        ]
      },
      {
        name: "Inductor",
        history: "The phenomenon of electromagnetic induction was discovered by Michael Faraday in London in 1831, after which coils began to be widely used in telegraph devices. The first industrial transformers with coils were developed by Zipernowsky, Bláthy and Déri in Budapest in 1885.",
        how: "An inductor is a wire wound into a coil that stores energy in a magnetic field when current flows through it. Inductance L (Henrys) defines how strongly the coil resists changes in current. Inductive reactance XL = 2πfL increases in proportion to frequency, so inductors are used in filters and resonant circuits to block or pass certain frequencies.",
        facts: [
          "A transformer is essentially two or more inductive coils sharing a common ferromagnetic core; energy transfer between them occurs via an alternating magnetic field with no galvanic contact.",
          "The Qi wireless charging standard used in smartphones transfers energy between two inductive coils across an air gap via electromagnetic induction at a frequency of 100–205 kHz."
        ]
      }
    ]
  }
}
