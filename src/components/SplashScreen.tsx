import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      const playStartSound = () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0, audioContext.currentTime + 0.2);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.2);
      };

      playStartSound();
    } catch (error) {
      console.log('Audio not available');
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400"></div>

        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-red-500 opacity-75" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative animate-pulse">
            <Zap className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
