let audioContext: AudioContext | null = null

interface Sound {
  osc: OscillatorNode
  gain: GainNode
}

const sounds: Record<string, Sound> = {}

function getContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new AudioContext()
    } catch (error) {
      return null
    }
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  return audioContext.state === 'running' ? audioContext : null
}

export function prepareAudio() {
  getContext()
}

function startSound(partId: string, type: string) {
  if (sounds[partId]) return
  const ctx = getContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime

  if (type === 'buzzer') {
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(380, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.08)
  } else if (type === 'motor') {
    osc.type = 'sine'
    osc.frequency.setValueAtTime(60, now)
    osc.frequency.setTargetAtTime(68, now, 1.2)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 0.15)
  } else if (type === 'inductor') {
    osc.type = 'sine'
    osc.frequency.setValueAtTime(50, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.03, now + 0.2)
  }

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  sounds[partId] = { osc, gain }
}

function stopSound(partId: string) {
  const sound = sounds[partId]
  if (!sound) return
  const ctx = getContext()
  if (ctx) {
    sound.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
    try {
      sound.osc.stop(ctx.currentTime + 0.15)
    } catch (error) {
      delete sounds[partId]
      return
    }
  }
  delete sounds[partId]
}

export function updateSounds(wanted: Record<string, string>) {
  Object.keys(wanted).forEach(id => startSound(id, wanted[id]))
  Object.keys(sounds).forEach(id => {
    if (!wanted[id]) stopSound(id)
  })
}
