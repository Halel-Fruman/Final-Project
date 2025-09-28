const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { messages, userId, role, imageUrl } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ reply: "Invalid message format" });
  }

  try {
    const fullMessages = [...messages];

    // ✅ If an image is provided, add it as a vision input
    if (imageUrl) {
  fullMessages.push({
    role: "user",
    content: [
      {
        type: "image_url",
        image_url: { url: imageUrl },
      },
    ],
  });
}

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: fullMessages,
      temperature: 0.5,
    });

    console.dir(completion, { depth: null });
    console.log("📨 GPT Reply Text:", completion.choices[0].message.content);

    let rawReply = completion.choices[0].message.content;
    let parsed = null;

    // Try parsing the raw JSON from GPT response
    try {
      parsed = JSON.parse(rawReply);
    } catch (e) {
      const match = rawReply.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error("❌ Nested JSON parse error:", match[0]);
        }
      }
    }

    if (parsed && typeof parsed === "object") {
      return res.json({
        reply: parsed.reply || "אין תגובה",
        action: parsed.action || null,
        payload: parsed.payload || null,
      });
    }

    console.warn("⚠ Could not extract valid JSON. Returning raw text.");
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

module.exports = router;
