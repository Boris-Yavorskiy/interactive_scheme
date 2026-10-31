import type { ComponentDef, Terminal } from '../types'

export const COMPONENTS: ComponentDef[] = [
  {
    "type": "battery",
    "category": "source",
    "label": {
      "uk": "Батарея",
      "en": "Battery"
    },
    "emfV": 9,
    "internalOhm": 0.5,
    "minVoltage": 1,
    "maxVoltage": 24,
    "width": 56,
    "height": 160
  },
  {
    "type": "wire",
    "category": "passive",
    "label": {
      "uk": "Провід",
      "en": "Wire"
    },
    "internalOhm": 0.02,
    "width": 160,
    "height": 69
  },
  {
    "type": "lamp",
    "category": "load",
    "label": {
      "uk": "Лампа",
      "en": "Lamp"
    },
    "resistanceOhm": 40,
    "minCurrentA": 0.05,
    "width": 87,
    "height": 160
  },
  {
    "type": "switch",
    "category": "control",
    "label": {
      "uk": "Вимикач",
      "en": "Switch"
    },
    "internalOhm": 0.02,
    "isOpenByDefault": true,
    "width": 160,
    "height": 134
  },
  {
    "type": "button",
    "category": "control",
    "label": {
      "uk": "Кнопка",
      "en": "Button"
    },
    "internalOhm": 0.02,
    "isOpenByDefault": true,
    "momentary": true,
    "width": 114,
    "height": 160
  },
  {
    "type": "resistor",
    "category": "passive",
    "label": {
      "uk": "Резистор",
      "en": "Resistor"
    },
    "resistanceOhm": 100,
    "resistorOptions": [
      10,
      47,
      100,
      220,
      470,
      1000
    ],
    "width": 160,
    "height": 46
  },
  {
    "type": "rheostat",
    "category": "passive",
    "label": {
      "uk": "Реостат",
      "en": "Rheostat"
    },
    "resistanceOhm": 50,
    "variable": true,
    "minOhm": 0,
    "maxOhm": 500,
    "width": 119,
    "height": 160
  },
  {
    "type": "ammeter",
    "category": "meter",
    "label": {
      "uk": "Амперметр",
      "en": "Ammeter"
    },
    "internalOhm": 0.01,
    "isMeter": true,
    "width": 154,
    "height": 160
  },
  {
    "type": "voltmeter",
    "category": "meter",
    "label": {
      "uk": "Вольтметр",
      "en": "Voltmeter"
    },
    "internalOhm": 1000000,
    "isMeter": true,
    "width": 150,
    "height": 160
  },
  {
    "type": "led",
    "category": "load",
    "label": {
      "uk": "Світлодіод (LED)",
      "en": "LED"
    },
    "resistanceOhm": 20,
    "polarized": true,
    "forwardDropV": 2,
    "minCurrentA": 0.01,
    "width": 67,
    "height": 160
  },
  {
    "type": "diode",
    "category": "passive",
    "label": {
      "uk": "Діод",
      "en": "Diode"
    },
    "resistanceOhm": 5,
    "polarized": true,
    "forwardDropV": 0.6,
    "width": 160,
    "height": 46
  },
  {
    "type": "motor",
    "category": "load",
    "label": {
      "uk": "Електродвигун",
      "en": "Electric Motor"
    },
    "resistanceOhm": 25,
    "minCurrentA": 0.08,
    "width": 160,
    "height": 97
  },
  {
    "type": "buzzer",
    "category": "load",
    "label": {
      "uk": "Зуммер",
      "en": "Buzzer"
    },
    "resistanceOhm": 60,
    "minCurrentA": 0.03,
    "width": 147,
    "height": 160
  },
  {
    "type": "fuse",
    "category": "control",
    "label": {
      "uk": "Запобіжник",
      "en": "Fuse"
    },
    "internalOhm": 0.05,
    "maxCurrentA": 1.5,
    "width": 160,
    "height": 35
  },
  {
    "type": "capacitor",
    "category": "storage",
    "label": {
      "uk": "Конденсатор",
      "en": "Capacitor"
    },
    "isCapacitor": true,
    "width": 78,
    "height": 160
  },
  {
    "type": "inductor",
    "category": "passive",
    "label": {
      "uk": "Котушка індуктивності",
      "en": "Inductor"
    },
    "internalOhm": 0.3,
    "width": 98,
    "height": 160
  }
]

export const COMPONENT_TERMINALS: Record<string, Terminal[]> = {
  "battery": [
    {
      "label": "pos",
      "x": 0.5242,
      "y": 0.0719
    },
    {
      "label": "neg",
      "x": 0.5242,
      "y": 0.8921
    }
  ],
  "wire": [
    {
      "label": "a",
      "x": 0.04,
      "y": 0.5
    },
    {
      "label": "b",
      "x": 0.96,
      "y": 0.5
    }
  ],
  "lamp": [
    {
      "label": "a",
      "x": 0.3624,
      "y": 0.9672
    },
    {
      "label": "b",
      "x": 0.6645,
      "y": 0.9672
    }
  ],
  "switch": [
    {
      "label": "a",
      "x": 0.1575,
      "y": 0.959
    },
    {
      "label": "b",
      "x": 0.6181,
      "y": 0.959
    }
  ],
  "button": [
    {
      "label": "a",
      "x": 0.1935,
      "y": 0.9144
    },
    {
      "label": "b",
      "x": 0.8122,
      "y": 0.9144
    }
  ],
  "resistor": [
    {
      "label": "a",
      "x": 0.0364,
      "y": 0.521
    },
    {
      "label": "b",
      "x": 0.9676,
      "y": 0.521
    }
  ],
  "rheostat": [
    {
      "label": "a",
      "x": 0.2208,
      "y": 0.9423
    },
    {
      "label": "b",
      "x": 0.8002,
      "y": 0.9427
    }
  ],
  "ammeter": [
    {
      "label": "neg",
      "x": 0.215,
      "y": 0.751
    },
    {
      "label": "pos",
      "x": 0.679,
      "y": 0.751
    }
  ],
  "voltmeter": [
    {
      "label": "neg",
      "x": 0.278,
      "y": 0.748
    },
    {
      "label": "pos",
      "x": 0.698,
      "y": 0.748
    }
  ],
  "led": [
    {
      "label": "a",
      "x": 0.2985,
      "y": 0.9583
    },
    {
      "label": "b",
      "x": 0.6965,
      "y": 0.9583
    }
  ],
  "diode": [
    {
      "label": "a",
      "x": 0.0369,
      "y": 0.5274
    },
    {
      "label": "b",
      "x": 0.959,
      "y": 0.5274
    }
  ],
  "motor": [
    {
      "label": "a",
      "x": 0.0789,
      "y": 0.5203
    },
    {
      "label": "b",
      "x": 0.9391,
      "y": 0.5203
    }
  ],
  "buzzer": [
    {
      "label": "a",
      "x": 0.1867,
      "y": 0.9559
    },
    {
      "label": "b",
      "x": 0.5335,
      "y": 0.9559
    }
  ],
  "fuse": [
    {
      "label": "a",
      "x": 0.0321,
      "y": 0.4735
    },
    {
      "label": "b",
      "x": 0.9714,
      "y": 0.4735
    }
  ],
  "capacitor": [
    {
      "label": "a",
      "x": 0.2735,
      "y": 0.96
    },
    {
      "label": "b",
      "x": 0.6929,
      "y": 0.96
    }
  ],
  "inductor": [
    {
      "label": "a",
      "x": 0.2162,
      "y": 0.9589
    },
    {
      "label": "b",
      "x": 0.7828,
      "y": 0.9589
    }
  ]
}

export const COMPONENT_MAP: Record<string, ComponentDef> = {}
COMPONENTS.forEach(c => {
  COMPONENT_MAP[c.type] = c
})

export function iconPath(type: string): string {
  return '/icons/' + type + '.png'
}
