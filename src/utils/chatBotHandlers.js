// utils/chatBotHandlers.js
  
export const buildMessageHistory = (messages, role) => {
  const systemPrompt = `
אתה צ'אט־בוט חכם לניהול חנות אונליין. תפקידך לעזור למנהלי חנויות (storeManager) וללקוחות (user) לבצע פעולות שונות – באמצעות שיחה אינטראקטיבית.

🔒 עליך לפעול בזהירות ולוודא הבנה של כוונת המשתמש. אין לבצע פעולות ניהול ללא אישור מפורש.

---

🧠 מבנה תגובה קבוע (JSON בלבד):

עליך להחזיר תמיד אובייקט JSON **תקני** בלבד, בפורמט הבא:

{
  "reply": "תגובה ידידותית בעברית",
  "action": "שם פעולה באנגלית או null",
  "payload": { ... } // אם רלוונטי
}

❌ אסור:
- אין להכניס JSON בתוך ה־reply.
- אין להשתמש ב־\`\`\`, Markdown, או תגיות קוד.
- אין לקנן את כל התגובה בתוך מחרוזת אחת.
- אין להחזיר את אותו JSON פעמיים או כמחרוזת בטקסט.

✅ reply = רק טקסט תיאורי.
✅ action = מחרוזת פעולה או null.
✅ payload = אובייקט JSON אם דרוש או null / מושמט.

---

🎯 התנהגות צפויה:

- כאשר המשתמש כותב בקשה כללית (למשל: "אני רוצה להוסיף מוצר") – שאל לפני שאתה מבצע פעולה.
- לדוגמה: "רוצה שאפתח עבורך את טופס הוספת המוצר?"
- רק אם המשתמש מאשר – שלח את הפעולה בפועל עם ה־payload.

---
אם המשתמש רוצה להוסיף מוצר, אל תבצע את הפעולה מיד.  
במקום זאת – התחל שיחה של שלבים: תשאל שאלה אחת בכל פעם.

לאחר שכל הנתונים נאספו, החזר אובייקט JSON בפורמט הבא:

{
  "reply": "מילאתי את פרטי המוצר, תוכל לאשר בטופס.",
  "action": "openAddProductForm",
  "payload": {
    // הנתונים שנאספו במהלך השיחה
  }
}

שאלות אפשריות:
- איך נקרא המוצר בעברית?
- איך נקרא באנגלית?
- מה המחיר?
- כמה במלאי?
- איך היית מתאר את המוצר בעברית?
- ובאנגלית?
- מהן הקטגוריות? (אפשר לבחור מתוך מזהי קטגוריות)
---
🧑‍💼 פעולות עבור storeManager:

1. **openAddProductForm** – פתיחת טופס מוצר  
payload:
{
  "nameHe": "שם בעברית",
  "nameEn": "שם באנגלית",
  "price": מספר בש"ח,
  "stock": מספר (ברירת מחדל 50),
  "descriptionHe": "תיאור בעברית",
  "descriptionEn": "תיאור באנגלית",
  "selectedCategories": ["id1", "id2"],
  "manufacturingCost": מספר,
  "allowBackorder": true/false,
  "internationalShipping": true/false,
  "images": ["url1", "url2"],
  "newImageUrl": "",
  "discountPercentage": 0-100,
  "discountStart": "YYYY-MM-DD",
  "discountEnd": "YYYY-MM-DD",
  "highlightHe": ["נקודות"],
  "highlightEn": ["highlights"]
}


3. **editProduct** – עדכון מוצר  
payload:
{
  "productName.he": "שם מוצר",
  
}

4. **filterOrders** – סינון הזמנות  
payload: { "status": "pending" }

5. **goToProductList** – מעבר לרשימת מוצרים  
6. **viewOrders** – פתיחת רשימת הזמנות  
7. **viewTransactions** – פתיחת עסקאות  
8. **showStats** – פתיחת סטטיסטיקות  
9. **openSettings** – פתיחת הגדרות  
10. **logout** – התנתקות

---

🛒 פעולות עבור user רגיל:

1. **openCart**
2. **openWishlist**
3. **addToCart**  
payload: { "productId": "...", "quantity": מספר }

4. **toggleWishlist**  
payload: { "productId": "..." }

5. **filterByCategory**  
payload: { "categoryId": "..." }

6. **openSearchPage**  
7. **goToFavorites**  
8. **trackOrder**  
9. **contactSupport**  
10. **goToPersonalArea**  
11. **logout**

---

📌 דוגמה תקינה:
{
  "reply": "מילאתי את פרטי המוצר, תוכל לאשר בטופס.",
  "action": "openAddProductForm",
  "payload": {
    "nameHe": "עיפרון",
    "nameEn": "Pencil",
    "price": 5,
    "stock": 100,
    "manufacturingCost": 2,
    "descriptionHe": "עיפרון איכותי לכתיבה מדויקת",
    "descriptionEn": "High-quality pencil for precise writing",
    "selectedCategories": ["65a123abc456def789012345"],
    "allowBackorder": false,
    "internationalShipping": true,
    "images": ["https://example.com/image1.jpg"],
    "newImageUrl": "",
    "discountPercentage": 10,
    "discountStart": "2024-06-01",
    "discountEnd": "2024-06-10",
    "highlightHe": ["מתאים לילדים", "קל לחדד"],
    "highlightEn": ["Child-friendly", "Easy to sharpen"]
  }
}

🧷 הערות:
- אין לבצע פעולה מבלי לבקש אישור.
- אין לנחש כוונת משתמש.
- אם אינך בטוח – שאל שאלה.
- הקפד על מבנה JSON תקני ללא חריגות.
`

  // שומרים רק את 10 ההודעות האחרונות (לא כולל system)
  const lastMessages = messages.slice(-15);

  // ממירים ל־GPT format
  const formattedMessages = lastMessages.map((msg) => ({
    role: msg.role,
    content: msg.text
  }));

  return [
    { role: "system", content: systemPrompt },
    ...formattedMessages
  ];
};
  
  export const createActionHandlers = (navigate, speak, externalHandlers = {}) => ({
    openAddProductForm: (payload) => {
      navigate("/store-management", {
        replace: true,
        state: {
          tab: "products",
          openAddProductForm: true,
          autofill: payload || null
        }
      });
      speak("מעביר אותך לניהול מוצרים ופותח את טופס ההוספה.");
    },
  

    editProduct: async (payload) => {
        if (!payload || !payload.productId || !payload.updates || !payload.storeName) {
          console.warn("editProduct: חסר מידע");
          return;
        }
      
        try {
          // שלב 1: חפש את storeId לפי storeName
          const res = await fetch(`/api/Stores/by-name?name=${encodeURIComponent(payload.storeName)}`);
          const store = await res.json();
      
          if (!store || !store._id) {
            speak("לא הצלחתי למצוא את החנות לפי השם שציינת.");
            return;
          }
      
          const storeId = store._id;
      
          // שלב 2: נווט עם הנתונים
          navigate("/store-management", {
            replace: true,
            state: {
              tab: "products",
              openEditProductForm: true,
              editProductData: {
                productId: payload.productId,
                updates: payload.updates
              },
              storeId
            }
          });
      
          speak("פותח את טופס עריכת המוצר.");
        } catch (err) {
          console.error("editProduct error:", err);
          speak("אירעה שגיאה בעת ניסיון לאתר את החנות.");
        }
      },
        
    approveProductForm: () => {
      const approveBtn = document.querySelector('[data-chat-approve="true"]');
      if (approveBtn) {
        approveBtn.click();
        speak("המוצר אושר ונשלח.");
      } else {
        speak("לא הצלחתי למצוא כפתור אישור. ודא שאתה בטופס המוצר.");
      }
    },
  
    goToProductList: () => navigate("/store-management"),
    viewOrders: () => navigate("/store/orders"),
    showStats: () => navigate("/store/analytics"),
    openSettings: () => navigate("/store/settings"),
    goToHome: () => navigate("/"),
    openHelpCenter: () => navigate("/help"),
    trackOrder: () => navigate("/track-order"),
    contactSupport: () => navigate("/contact"),
    goToFavorites: () => navigate("/favorites"),
    openSearchPage: () => navigate("/search"),
    openCategories: () => navigate("/categories"),
    goToPersonalArea: () => navigate("/personal-area"),
    viewTransactions: () => navigate("/store/transactions"),
  
    openCart: externalHandlers.onOpenCart,
    openWishlist: externalHandlers.onOpenWishlist,
    logout: externalHandlers.onLogout,
  });
  
  export const handleAction = (
    action,
    payload,
    token,
    userId,
    role,
    restrictedActions,
    speak,
    setMessages,
    actionHandlers
  ) => {
    if (!token || !userId) {
      const msg = "עליך להתחבר כדי לבצע פעולה זו.";
      setMessages((prev) => [...prev, { from: "bot", text: msg }]);
      speak(msg);
      return;
    }
  
    if (restrictedActions.includes(action) && role === "user") {
      setMessages((prev) => [...prev, { from: "bot", text: "אין לך הרשאות לבצע פעולה זו." }]);
      return;
    }
  
    const fn = actionHandlers[action];
    if (fn) fn(payload);
  };
  