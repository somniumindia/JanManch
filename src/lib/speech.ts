'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechDictationOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  lang?: string;
  onError?: (errorMessage: string) => void;
}

export function useSpeechDictation({ onTranscript, lang = 'en-IN', onError }: SpeechDictationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const msg = 'Microphone access requires permission and must run on localhost or HTTPS.';
      setError(msg);
      onError?.(msg);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      // Requirement: continuous = false and interimResults = true
      recognition.continuous = false;
      recognition.interimResults = true;
      // Requirement: recognition.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN'
      recognition.lang = lang.startsWith('hi') ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          transcript += item[0].transcript;
          if (item.isFinal) {
            isFinal = true;
          }
        }

        if (transcript.trim()) {
          onTranscript(transcript.trim(), isFinal);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          const msg = 'Microphone access requires permission and must run on localhost or HTTPS.';
          setError(msg);
          onError?.(msg);
        } else if (event.error === 'no-speech') {
          // Gracefully catch no-speech without crashing
          setError(null);
        } else {
          const msg = `Speech error: ${event.error}`;
          setError(msg);
          onError?.(msg);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      const msg = 'Microphone access requires permission and must run on localhost or HTTPS.';
      setError(msg);
      onError?.(msg);
      setIsListening(false);
    }
  }, [lang, onTranscript, onError]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
