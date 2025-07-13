import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import useSpeechRecognition from "../utils/useSpeechRecognition";

/**
 * @component VoiceInputButton
 * @description A button component that uses the Web Speech API to transcribe voice input into text.
 * @param {function} onResult - Callback function to handle the transcription result.
 * @param {string} [lang="he-IL"] - The language code for the speech recognition.
 */
const VoiceInputButton = ({ onResult, lang = "he-IL" }) => {
  const { startListening, isListening, error } = useSpeechRecognition({
    onResult,
    lang,
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          startListening();
        }}
        className={`absolute top-1/2 transform -translate-y-9 left-4 flex items-center gap-1 px-2 py-1 rounded-full border transition-all text-xxs ${
          isListening
            ? "bg-blue-100 text-blue-600 border-blue-400 animate-pulse"
            : "bg-transparent text-gray-500 border-gray-300 hover:bg-primaryColor hover:text-white"
        }`}
        title="תמלול טקסט">
        {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        <span className="hidden sm:inline">
          {isListening ? "מתמלל..." : "תמלול"}
        </span>
      </button>
      {error && error !== "aborted" && (
        <span className="text-red-500 text-xs absolute -top-5 left-0">
          {error === "not-allowed" ? "אין הרשאה למיקרופון" : error}
        </span>
      )}
    </div>
  );
};

export default VoiceInputButton;
