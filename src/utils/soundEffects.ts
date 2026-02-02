let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playSound = (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine') => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (error) {
    console.log('Audio context not available');
  }
};

export const playSuccessSound = () => {
  playSound(523.25, 0.1);
  setTimeout(() => playSound(659.25, 0.1), 100);
  setTimeout(() => playSound(783.99, 0.2), 200);
};

export const playErrorSound = () => {
  playSound(300, 0.1);
  setTimeout(() => playSound(250, 0.2), 100);
};

export const playClickSound = () => {
  playSound(400, 0.05);
};

export const playNotificationSound = () => {
  playSound(800, 0.05);
  setTimeout(() => playSound(600, 0.05), 100);
};
