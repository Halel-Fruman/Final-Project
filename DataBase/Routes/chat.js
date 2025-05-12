const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat
router.post("/", async (req, res) => {
  const { messages, userId, role } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ reply: "פורמט הודעות לא תקין" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // אפשר לשדרג ל־gpt-4o
      messages, // ⬅️ ההיסטוריה מגיעה מהפרונט כולל system
      temperature: 0.5,
    });

    const rawReply = completion.choices[0].message.content;

    // ננסה לפרש JSON מתוך התשובה
    let parsed;
    try {
      parsed = JSON.parse(rawReply);
    } catch (err) {
      console.error("❌ JSON parse error:", rawReply);
      return res.json({
        reply: rawReply,
        action: null,
        payload: null
      });
    }

    res.json({
      reply: parsed.reply || "אין תגובה",
      action: parsed.action || null,
      payload: parsed.payload || null
    });

  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    res.status(500).json({
      reply: "אירעה שגיאה עם הבוט. נסה שוב מאוחר יותר.",
      action: null,
      payload: null
    });
  }
});

module.exports = router;
