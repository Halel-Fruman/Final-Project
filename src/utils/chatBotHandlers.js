// utils/chatBotHandlers.js

export const buildMessageHistory = (messages, role) => {
 const systemPrompt = `
You are a smart and accessible chatbot integrated into ILAN’s e-commerce website.
Your purpose is to assist site users — private customers and store managers with disabilities — in performing useful actions in a simple, accessible, and conversational manner.

The site serves as a social commerce platform, where users can purchase products, and store managers (storeManager) can manage their products, orders, and store statistics in an equal and efficient way.

---

 Act carefully and with context awareness. Respect the user's permission level and always try to infer their intent based on recent chat history (up to 15 previous messages). Your goal is to help them efficiently without over-asking.

You are allowed to act without confirmation if the user request is clear and direct.
If any field or detail is missing (especially in editing or creation actions), ask for it conversationally.

If the user explicitly confirms a previous suggestion (e.g., says "כן", "תפתח", "יאללה", etc.), you **must** return a valid 'action'. Never return 'action: null' in this case.

---

 Response format:
Always return a valid JSON object (not as a string or markdown).

Valid format:
{
  "reply": "Friendly and clear response in Hebrew",
  "action": "actionNameInEnglish or null",
  "payload": { ... } // if required
}

Do NOT:
- Wrap JSON in strings or inside the reply field.
- Use markdown, code tags, or formatting markers.

 reply = only a simple Hebrew message.
action = one of the allowed actions (see below), or null.
 payload = relevant structured data or omit/null if unnecessary.

---

 Examples of behavior:

If the user says "תראה לי את המוצרים שלי" →
{
  "reply": "מעביר אותך לדף ניהול המוצרים.",
  "action": "goToProductList"
}

 If the user says "אני רוצה להוסיף מוצר חדש" →
{
  "reply": "פותח עבורך את טופס הוספת המוצר.",
  "action": "openAddProduct"
}

 

 

 If the user says "כן פתח את הדף" (after suggestion), respond with:
{
  "reply": "פותח את דף ניהול המוצרים כעת.",
  "action": "goToProductList"
}

---

Examples of relevant fields for payload:
- nameHe, nameEn
- price, stock
- manufacturingCost
- highlightHe, highlightEn
- descriptionHe, descriptionEn
- selectedCategories
- allowBackorder, internationalShipping
- images (URLs), discount info (percentage, startDate, endDate)

---

 Allowed actions:

#### For storeManager:
- 'goToProductList' — Navigate to product management page
- 'openAddProduct' — Clicks the add button
- 'openAddProductForm' — Fills the product form using payload
- 'openEditProduct' — Opens a specific product for editing
- 'editProduct' — Applies field updates
- 'viewStoreOrders'
- 'viewTransactions'
- 'showStats'
- 'openSettings'
- 'logout'

#### For user:
- 'openCart'
- 'openWishlist'
- 'addToCart'
- 'toggleWishlist'
- 'filterByCategory'
- 'openSearchPage'
- 'goToFavorites'
- 'trackOrder'
- 'contactSupport'
- 'goToPersonalArea'
- 'goToPersonalOrders'
- 'logout'

---

 Summary:
- Be efficient and act on clear user intent.
- If required data is missing, ask step by step.
- Never wrap JSON in strings.
- Avoid repeating what the user already knows.
- Use conversational Hebrew in replies.`

;



  // שומרים רק את 10 ההודעות האחרונות (לא כולל system)
  const lastMessages = messages.slice(-15);

  // ממירים ל־GPT format
  const formattedMessages = lastMessages.map((msg) => ({
    role: msg.role,
    content: msg.text,
  }));

  return [{ role: "system", content: systemPrompt }, ...formattedMessages];
};

export const createActionHandlers = (
  navigate,
  speak,
  externalHandlers = {}
) => ({
  goToProductList: () => {
    navigate("/store-management");
    speak("מעביר אותך לעמוד ניהול המוצרים.");
  },

  openAddProduct: () => {
    // פעולה שמטרתה רק לפתוח את הטופס (בלי למלא)
    if (window.location.pathname === "/store-management") {
      const event = new Event("openAddProductForm");
      window.dispatchEvent(event);
      speak("פותח את טופס הוספת המוצר.");
    } else {
      speak("יש לעבור קודם לעמוד ניהול המוצרים.");
    }
  },

  openAddProductForm: (payload) => {
    // מניחים שכבר נמצאים בעמוד ונשלח payload למילוי
    if (window.location.pathname === "/store-management") {
      window.dispatchEvent(
        new CustomEvent("autofillProductForm", { detail: payload })
      );
      speak("ממלא את פרטי המוצר בטופס.");
    } else {
      speak("יש לפתוח קודם את דף ניהול המוצרים.");
    }
  },

  openEditProduct: (productId) => {
    if (!productId) {
      speak("לא צוין מזהה מוצר לעריכה.");
      return;
    }
    if (window.location.pathname === "/store-management") {
      window.dispatchEvent(
        new CustomEvent("openEditProductForm", { detail: { productId } })
      );
      speak("פותח את טופס עריכת המוצר.");
    } else {
      speak("יש לפתוח קודם את דף ניהול המוצרים.");
    }
  },

  editProduct: async (payload) => {
    if (
      !payload ||
      !payload.productId ||
      !payload.updates ||
      !payload.storeName
    ) {
      console.warn("editProduct: חסר מידע");
      return;
    }

    try {
      const res = await fetch(
        `/api/Stores/by-name?name=${encodeURIComponent(payload.storeName)}`
      );
      const store = await res.json();

      if (!store || !store._id) {
        speak("לא הצלחתי למצוא את החנות לפי השם שציינת.");
        return;
      }

      const storeId = store._id;

      navigate("/store-management", {
        replace: true,
        state: {
          tab: "products",
          openEditProductForm: true,
          editProductData: {
            productId: payload.productId,
            updates: payload.updates,
          },
          storeId,
        },
      });

      speak("פותח את טופס עריכת המוצר.");
    } catch (err) {
      console.error("editProduct error:", err);
      speak("אירעה שגיאה בעת ניסיון לאתר את החנות.");
    }
  },

  viewStoreOrders: () => navigate("/store/orders"),
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
  goToPersonalOrders: () =>
    navigate("/personal-area", { state: { selectedTab: "orders" } }),
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
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "אין לך הרשאות לבצע פעולה זו." },
    ]);
    return;
  }

  const fn = actionHandlers[action];
  if (fn) fn(payload);
};
