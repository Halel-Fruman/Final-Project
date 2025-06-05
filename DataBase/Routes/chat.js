const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { messages, userId, role } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ reply: "פורמט הודעות לא תקין" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages,
      temperature: 0.5,
    });
console.dir(completion, { depth: null });
console.log("📨 GPT Reply Text:", completion.choices[0].message.content);

    let rawReply = completion.choices[0].message.content;
    let parsed = null;

    // 🔍 ננסה לפרש JSON תקני ישיר
    try {
      parsed = JSON.parse(rawReply);
    } catch (e) {
      // 🔍 אם זה נכשל – ננסה לחלץ JSON מתוך טקסט
      const match = rawReply.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error("❌ Nested JSON parse error:", match[0]);
        }
      }
    }

    // ✅ אם הצלחנו לפענח – נחזיר את התוצאה
    if (parsed && typeof parsed === "object") {
      return res.json({
        reply: parsed.reply || "אין תגובה",
        action: parsed.action || null,
        payload: parsed.payload || null,
      });
    }

    // ❌ אם הכל נכשל – נחזיר את הטקסט המקורי
    console.warn("⚠ לא נמצא JSON תקני. מחזירים טקסט כמו שהוא.");
    return res.json({
      reply: rawReply,
      action: null,
      payload: null,
    });

  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    res.status(500).json({
      reply: "אירעה שגיאה עם הבוט. נסה שוב מאוחר יותר.",
      action: null,
      payload: null,
    });
  }
});

module.exports = router;