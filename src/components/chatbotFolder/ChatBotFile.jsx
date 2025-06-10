import React, { useState, useEffect } from "react";
import { FaPaperPlane, FaMicrophone } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import chatImage from "./chatImage2.png";
import { useNavigate } from "react-router-dom";

import {
  buildMessageHistory,
  createActionHandlers,
  handleAction,
} from "../../utils/chatBotHandlers";

const ChatBot = ({
  token,
  userId,
  onOpenCart,
  onOpenWishlist,
  onLogout,
  onOpenAddProductForm,
  onCreateDiscount,
  onSendNewsletter,
}) => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("guest");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const bottomRef = React.useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const timeout = setTimeout(() => {
        setMessages([
          { role: "assistant", text: "שלום! איך אפשר לעזור לך היום?" },
        ]);
      }, 800); // או 1000ms

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role || "customer");
      } catch {
        setRole("guest");
      }
    }
  }, [token]);

  useEffect(() => {
    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const hebrewVoices = allVoices.filter((v) => v.lang.startsWith("he"));
      setVoices(hebrewVoices);

      if (!selectedVoice) {
        const preferred = hebrewVoices.find((v) =>
          /female|woman|נשי|Google ישראלית/i.test(v.name)
        );
        if (preferred) setSelectedVoice(preferred);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoice]);

  const toggleChat = () => setIsOpen(!isOpen);

  const speak = (text) => {
    if (!isSpeakingEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };
  const actionHandlers = createActionHandlers(navigate, speak, {
    onOpenCart,
    onOpenWishlist,
    onLogout,
  });

  const startListening = () => {
    setIsListening(true);
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "he-IL";
    recognition.interimResults = false;
 recognition.onend = () => {
      setIsListening(false); // מפסיק להאזין אוטומטית כשהמערכת מסיימת
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false); // שגיאה -> מפסיק להאזין
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    

    recognition.start();
  };

  const sendMessage = async (customInput = null) => {
    const userMessage = customInput !== null ? customInput : input;
    if (!userMessage.trim()) return;

    if (!token || !userId) {
      const msg = { role: "assistant", text: "עליך להתחבר כדי להשתמש בצ'אט." };
      setMessages((prev) => [...prev, msg]);
      speak(msg.text);
      return;
    }

    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const formattedMessages = buildMessageHistory(newMessages, role);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: formattedMessages, userId, role }),
    });

    const data = await response.json();
    const botMessage = {
      role: "assistant",
      text: data.reply || "לא הצלחתי להבין.",
    };

    setMessages((prev) => [...prev, botMessage]);
    speak(botMessage.text);

    if (data.action) {
      const restrictedActions = [
        "openAddProductForm",
        "goToProductList",
        "viewOrders",
        "showStats",
        "openSettings",
        "createDiscount",
        "sendNewsletter",
        "viewTransactions",
      ];

      handleAction(
        data.action,
        data.payload || null,
        token,
        userId,
        role,
        restrictedActions,
        speak,
        setMessages,
        actionHandlers
      );
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isHidden ? (
        <button
          className="fixed bottom-4 left-4 z-50 bg-primaryColor text-white px-3 py-1 rounded-full text-sm shadow"
          onClick={() => setIsHidden(false)}>
          פתח את הבוט
        </button>
      ) : (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex flex-col items-center">
            {!isOpen && !isHidden && (
              <div className="mb-1 ml-2 bg-white text-sm text-primaryColor px-3 py-1 rounded-full shadow-md border border-gray-200">
                היי, איך אפשר לעזור?
              </div>
            )}
            <button
              className="w-24 h-24 shadow-lg rounded-full overflow-hidden border-2 border-primaryColor bg-transparent p-0"
              onClick={toggleChat}>
              <img
                src={chatImage}
                alt=""
                className="w-full h-full rounded-full"
              />
            </button>
            <button
              onClick={() => {
                setIsHidden(true);
                setIsOpen(false);
              }}
              className="text-xs text-gray-500 hover:text-red-600 mt-2 underline">
              הסתר בוט
            </button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-80 h-[30rem] bg-white rounded-3xl shadow-2xl flex flex-col p-4 mt-2">
                <div className="mb-2">
                  <label className="text-xs text-gray-500 block mb-1">
                    בחר קול
                  </label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    onChange={(e) => {
                      const selected = voices.find(
                        (v) => v.name === e.target.value
                      );
                      setSelectedVoice(selected);
                    }}
                    value={selectedVoice?.name || ""}>
                    <option value="">ברירת מחדל</option>
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <label className="text-xs text-gray-500 block mt-2">
                    <input
                      type="checkbox"
                      checked={isSpeakingEnabled}
                      onChange={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                      className="mr-1"
                    />
                    השמע תגובות קוליות
                  </label>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 text-sm pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-100 self-end"
                          : "bg-secondaryColor self-start"
                      }`}>
                      {msg.text}
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="text-center text-gray-500">טוען...</div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`text-xl transition-colors duration-300 ${
          isListening ? "text-red-500" : "text-primaryColor"
        }`}
                    aria-label="דבר">
                    <FaMicrophone />
                  </button>
                  <input
                    type="text"
                    className="flex-grow border rounded-full px-4 py-1 text-sm focus:outline-none"
                    placeholder="כתוב כאן..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    onClick={() => sendMessage()}
                    className="text-primaryColor text-xl"
                    aria-label="שלח">
                    <FaPaperPlane />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
