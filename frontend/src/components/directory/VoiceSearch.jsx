import { useState, useEffect, useRef } from 'react';
import { Mic, Check } from 'lucide-react';

export default function VoiceSearch({ onTranscript, vertical }) {
  const [state, setState] = useState('idle'); // idle, listening, processing, done
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return; // Hide voice search if not supported
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);

      if (event.results[0].isFinal) {
        setState('processing');
        onTranscript(currentTranscript, vertical);
        
        setTimeout(() => {
          setState('done');
          setTimeout(() => {
            setState('idle');
            setTranscript('');
          }, 1500);
        }, 800);
      }
    };

    recognition.onerror = () => {
      setState('idle');
      setTranscript('');
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;
  }, [vertical, onTranscript, state]);

  const startListening = () => {
    if (recognitionRef.current && state === 'idle') {
      setState('listening');
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && state === 'listening') {
      recognitionRef.current.stop();
      setState('idle');
    }
  };

  // Don't render if browser doesn't support speech recognition
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    return null;
  }

  if (state === 'idle') {
    return (
      <div
        onClick={startListening}
        className="relative overflow-hidden rounded-2xl p-4 cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
          animation: 'breathe 3s ease-in-out infinite'
        }}
      >
        <style>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .shimmer-flash {
            animation: shimmer 3.5s ease-in-out infinite;
          }
        `}</style>
        
        <div className="absolute inset-0 shimmer-flash opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            width: '50%'
          }}
        />
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Mic className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          
          <div className="flex-1">
            <div className="text-white font-bold text-base">
              Try AI Voice Search
            </div>
            <div className="text-white/60 text-sm font-medium">
              Just say what you're looking for
            </div>
          </div>
          
          <div className="px-2.5 py-1 rounded-full text-white/80 text-xs font-bold uppercase"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            AI
          </div>
        </div>
      </div>
    );
  }

  if (state === 'listening') {
    return (
      <div
        onClick={stopListening}
        className="relative rounded-2xl p-4 cursor-pointer"
        style={{
          background: '#FAFAF7',
          border: '2px solid #2D6A4F',
          boxShadow: '0 0 0 4px rgba(45,106,79,0.1)'
        }}
      >
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes wave {
            0%, 100% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
          }
          .pulse-ring {
            animation: pulse-ring 1.5s ease-out infinite;
          }
        `}</style>
        
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(45,106,79,0.1)' }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-sage pulse-ring" />
            <div className="absolute inset-0 rounded-full border-2 border-sage pulse-ring" style={{ animationDelay: '0.5s' }} />
            <Mic className="w-5 h-5 text-sage relative z-10" strokeWidth={2} />
          </div>
          
          <div className="flex-1">
            <div className="text-sage font-bold text-base">
              {transcript || 'Listening...'}
            </div>
            <div className="text-sage/60 text-sm font-medium">
              Tap to stop
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-8 bg-sage rounded-full"
                style={{
                  animation: 'wave 0.8s ease-in-out infinite alternate',
                  animationDelay: `${i * 0.08}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(82,183,136,0.08), rgba(82,183,136,0.15))'
        }}
      >
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-mint border-t-transparent rounded-full"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
          
          <div className="flex-1">
            <div className="text-mint font-bold text-base">
              Understanding your request...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(82,183,136,0.08), rgba(82,183,136,0.15))'
        }}
      >
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        
        <div className="flex items-center gap-3" style={{ animation: 'popIn 0.3s ease-out' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-mint">
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          
          <div className="flex-1">
            <div className="text-mint font-bold text-base">
              Got it — searching now
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
