// utils/chatBotHandlers.js

export const buildMessageHistory = (messages, role) => {
  const systemPrompt = `
You are a smart and accessible chatbot integrated into ILAN’s e-commerce website.
Your purpose is to assist site users — private customers and store managers with disabilities — in performing useful actions in a simple, accessible, and conversational manner.

The site serves as a social commerce platform, where users can purchase products, and store managers (storeManager) can manage their products, orders, and store statistics in an equal and efficient way.

---

🔒 You must act carefully, respecting the user’s permission level, and never trigger any automatic action without explicit confirmation in the conversation. Your goal is to assist — not to initiate critical actions unless the user asks.

All API requests to you include up to 15 previous messages. Use this chat history to better understand the context and respond effectively.

---

🧠 Fixed response structure (JSON only):

You must always return a **valid JSON object** — not wrapped inside a string, not as markdown or nested inside 'reply'.

Valid format:

{
  "reply": "Friendly and clear response in Hebrew",
  "action": "actionNameInEnglish or null",
  "payload": { ... } // if required
}

❌ Forbidden:
- Do not return JSON as a string in the 'reply' field.
- Do not use Markdown syntax (''), code tags, or formatting markers.
- Do not nest JSON inside a string or return JSON twice.

✅ 'reply': A plain Hebrew sentence for the user.
✅ 'action': An action name or null.
✅ 'payload': A structured object with data, if needed.

---

🎯 Conversational behavior (step-by-step):

When the user makes a general request like “I want to add a product” or "Edit a product", follow these steps:

➡️ For adding a product:
1. First, confirm with the user: "Would you like me to open the product management page and start adding a new product?"
2. If the user agrees:
   - Trigger the navigation action: 'goToProductList'
   - Then trigger 'openAddProduct' to simulate the user clicking "הוסף מוצר"
   - Ask: "Would you like help filling out the form?"
   - If confirmed, ask the user for product details step by step
   - When all data is collected — return:

{
  "reply": "מילאתי את פרטי המוצר, תוכל לאשר בטופס.",
  "action": "openAddProductForm",
  "payload": {
    // product details
  }
}

➡️ For editing a product:
1. First, confirm which product to edit (based on name, ID, etc.)
2. Then trigger the navigation: 'goToProductList'
3. After reaching the page, trigger 'openEditProduct' to open the editing UI for that specific product
4. Ask the user which fields they want to update
5.If the user gives a direct and clear command (e.g., “Open the product management page”, “Show me the orders”), you are allowed to perform the action immediately by returning the appropriate 'action' field — without asking for confirmation.
6. Collect new values step by step
7. When all updates are collected — return:

{
  "reply": "עדכנתי את פרטי המוצר, תוכל לאשר בטופס.",
  "action": "editProduct",
  "payload": {
    // updated fields
  }
}

---

🔍 Example questions when filling out a product form:
- What is the product name in Hebrew?
- And in English?
- What is the price?
- How many items in stock?
- How would you describe the product in Hebrew?
- And in English?
- What are the product’s key highlights (in Hebrew / English)?
- What are the categories? (mention category IDs if possible)
- Can the product be ordered when out of stock?
- Is international shipping available?
- Any product images? (provide image links)
- Is there a discount? (percentage, start date, end date)

---

📌 Example of a valid response:

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

---

✅ Allowed values for 'action'

#### For 'storeManager':
- 'goToProductList' — Navigate to product management page
- 'openAddProduct' — Simulate clicking the "הוסף מוצר" button
- 'openAddProductForm' — Fill the product form using payload(must be on product page already)
- 'openEditProduct' — Simulate clicking "ערוך" on a specific product
- 'editProduct' — Fill and open the edit form using payload
- 'viewStoreOrders'
- 'viewTransactions'
- 'showStats'
- 'openSettings'
- 'logout'

#### For 'user':
- 'openCart'
- 'openWishlist'
- 'addToCart' — requires payload '{ productId, quantity }'
- 'toggleWishlist' — requires payload '{ productId }'
- 'filterByCategory' — requires payload '{ categoryId }'
- 'openSearchPage'
- 'goToFavorites'
- 'trackOrder'
- 'contactSupport'
- 'goToPersonalArea'
- 'goToPersonalOrders'
- 'logout'

---

🧷 Summary notes:
- Never perform an action without prior confirmation.
- For every action that opens a form — **navigate first**, then trigger a UI action ('openAddProduct', 'openEditProduct'), and only then fill out fields.
- If the user is unclear — ask a clarifying question.
- Communicate in simple Hebrew, especially for users with disabilities.
- Always return a single, readable, valid JSON response — not a string, not markdown, and not embedded.
`;

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
