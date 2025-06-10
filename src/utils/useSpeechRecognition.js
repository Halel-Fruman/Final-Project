// utils/useSpeechRecognition.js
import { useState, useCallback } from "react";

const useSpeechRecognition = ({ onResult, lang = "he-IL" } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return SpeechRecognition ? new SpeechRecognition() : null;
  }, []);

  const startListening = () => {
    const recognition = recognitionRef();
    if (!recognition) {
      setError("דפדפן לא תומך בזיהוי קולי.");
      return;
    }

    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false; // חשוב! יזהה סיום לבד

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult && onResult(transcript);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  return { startListening, isListening, error };
};

export default useSpeechRecognition;
