// utils/chatBotHandlers.js
import { useState } from "react";
export const buildMessageHistory = (messages, role) => {
  const systemPrompt = `
You are a smart and accessible chatbot integrated into ILAN’s e-commerce website.
Your purpose is to assist site users — private customers and store managers with disabilities — in performing useful actions in a simple, accessible, and conversational manner.

The site serves as a social commerce platform, where users can purchase products, and store managers (storeManager) can manage their products, orders, and store statistics in an equal and efficient way.

---

 You must act carefully, respecting the user’s permission level, and never trigger any automatic action without explicit confirmation in the conversation. Your goal is to assist — not to initiate critical actions unless the user asks.

If the user explicitly confirms a previous suggestion (e.g., says "כן", "תפתח", "יאללה", etc.), you **must** return a valid 'action'. Never return 'action: null' in this case.

---

 Fixed response structure (JSON only):

You must always return a **valid JSON object** — not wrapped inside a string, not as markdown or nested inside 'reply'.

Valid format:
{
  "reply": "Friendly and clear response in Hebrew",
  "action": "actionNameInEnglish or null",
  "payload": { ... } // if required
}

 Forbidden:
- Do not return JSON as a string in the 'reply' field.
- Do not use Markdown syntax (''), code tags, or formatting markers.
- Do not nest JSON inside a string or return JSON twice.

 'reply': A plain Hebrew sentence for the user.
 'action': An action name or null.
 'payload': A structured object with data, if needed.

---

 Conversational behavior (step-by-step):

When the user makes a general request like “I want to add a product” or "Edit a product", follow these steps:

 For adding a product:
1. First, confirm with the user: "Would you like me to open the product management page and start adding a new product?"
2. If the user agrees:
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

 For editing a product:
1. First, confirm which product to edit (based on name, ID, etc.)
2. After reaching the page, trigger 'openEditProduct' to open the editing UI for that specific product.
 3. Ask the user which fields they want to update.
 4. For each field the user requests to change, collect it step-by-step.
 5. After each confirmed update, return:

 {
   "reply": "עדכנתי את המחיר ל-10 ש\"ח.",
   "action": "editProduct",
   "payload": {
     "productName": "עיפרון",
     "newFields": {
       "price": 10
     }
   }
 }

---

 Example questions when filling out a product form:
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
Example of editing a product:

If the user says "שנה את המחיר של העיפרון ל-10 ש"ח":

1. First, navigate to the product management page ('goToProductList').
2. Then, open the specific product for editing using the 'openEditProduct' action.
3. The 'payload' should include the product name to locate the product.

Example of valid response to open the edit page:

{
  "reply": "פותח את דף עריכת המוצר.",
  "action": "openEditProduct",
  "payload": {
    "productName": "עיפרון"
  }
}

After the product form is open, ask the user what fields they want to edit.
Collect each field step-by-step and update them gradually.

⚠️ Always proceed step-by-step:
- Open page → Open product by name → Ask for updates → Apply updates.

Example of a valid response to update product fields:

{
  "reply": "עדכנתי את שם המוצר ל-'קערה לחגים'.",
  "action": "editProduct",
  "payload": {
    "productName": "קערה לחגי תשרי",
    "newFields": {
      "nameHe": "קערה לחגים"
    }
  }
}

Explanation:
- 'productName': the current name of the product in the system.
- 'newFields': object containing only the fields that should be updated.

Allowed fields inside 'newFields':
- nameHe (string)
- nameEn (string)
- price (number)
- stock (number)
- manufacturingCost (number)
- descriptionHe (string)
- descriptionEn (string)
- highlightHe (array of strings)
- highlightEn (array of strings)
- selectedCategories (array of category IDs)
- allowBackorder (boolean)
- internationalShipping (boolean)
- images (array of URLs)
- discountPercentage (number)
- discountStart (ISO date string)
- discountEnd (ISO date string)

⚠️ You must not invent field names. Use only the allowed fields.



---

 Example of a valid response:

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
    "discountPercentage": 10,
    "discountStart": "2024-06-01",
    "discountEnd": "2024-06-10",
    "highlightHe": ["מתאים לילדים", "קל לחדד"],
    "highlightEn": ["Child-friendly", "Easy to sharpen"]
  }
}

---

 Allowed values for 'action'

#### For 'storeManager':
- 'goToProductList' — Navigate to product management page
- 'openAddProduct' — Clicks the add button
- 'openAddProductForm' — Fills the product form using payload
- 'openEditProduct' — Opens a specific product for editing
- 'editProduct' — Applies specific field changes to a product currently open for editing. Requires 'productName' and 'newFields' keys in the payload This action may be used repeatedly, once per confirmed field update..
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

 Summary notes:
- Never perform an action without prior confirmation.
- For every action that opens a form — **navigate first**, then trigger a UI action ('openAddProduct', 'openEditProduct'), and only then fill out fields.
- If the user is unclear — ask a clarifying question.
- Communicate in simple Hebrew, especially for users with disabilities.
- Always return a single, readable, valid JSON response — not a string, not markdown, and not embedded.
`;

  const lastMessages = messages.slice(-20);

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
) => {
  let productName = "";
  const setProductName = (name) => {
    if (typeof name === "string") {
      productName = name.trim();
    } else if (name && typeof name === "object" && name.productName) {
      productName = name.productName.trim();
    } else {
      productName = "";
    }
  };
  return{
  goToProductList: () => {
    navigate("/store-management", {
      state: { tab: "products" },
      replace: true,
    });
    speak("מעביר אותך לעמוד ניהול המוצרים.");
  },

  openAddProduct: () => {
    if (window.location.pathname === "/store-management") {
      const event = new Event("openAddProductForm");
      window.dispatchEvent(event);
      speak("פותח את טופס הוספת המוצר.");
    } else {
      navigate("/store-management", {
        state: { tab: "products", openAddProductForm: true },
        replace: true,
      });
      const event = new Event("openAddProductForm");
      window.dispatchEvent(event);
    }
  },

  openAddProductForm: (payload) => {
    console.log(window.location.pathname);
    if (window.location.pathname === "/shop/store-management") {
      console.log("true");
      window.dispatchEvent(
        new CustomEvent("autofillProductForm", { detail: payload })
      );
      speak("ממלא את פרטי המוצר בטופס.");
    } else {
      console.log("false");

      navigate("/store-management", {
        state: { tab: "products", openAddProductForm: true, autofill: payload },
        replace: true,
      });
      window.dispatchEvent(
        new CustomEvent("autofillProductForm", { detail: payload })
      );
    }
  },

  openEditProduct: (payload) => {
    setProductName(payload || {});

    if (!productName) {
      speak("לא צוין שם מוצר לעריכה.");
      return;
    }

    if (window.location.pathname !== "/store-management") {
      // לא בדף הנכון — ננווט קודם
      navigate("/store-management", {
        state: { tab: "products" }, // אם יש לך טאב מוצרים
        replace: true,
      });

      // רגע! לא להמשיך מיד — נחכה שהניווט יקרה
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("openEditProduct", { detail: { productName } })
        );
        speak(`מחפש את המוצר "${productName}" ופותח עריכה.`);
      }, 500); // חצי שנייה שיהיה זמן לניווט
      return;
    }

    // אם כבר בדף הנכון — שולח ישר
    window.dispatchEvent(
      new CustomEvent("openEditProduct", { detail: { productName } })
    );
    speak(`מחפש את המוצר "${productName}" ופותח עריכה.`);
  },

  editProduct: (payload) => {
    if (!payload || !payload.productName || !payload.newFields) {
      console.warn("Invalid payload for editProduct:", payload);
      speak("חסר מידע לעדכון המוצר.");
      return;
    }
    console.log("editProduct payload:", payload);

    // const isEditOpen = document.getElementById("edit-product-modal");
    // console.log("isEditOpen:", isEditOpen);
    if (window.location.pathname === "/shop/store-management") {
      console.log("here");
       window.dispatchEvent(
          new CustomEvent("autofillEditProductForm", {
            detail: {
              newFields: payload.newFields,
              productName: payload.productName,
            },
          })
        );
      speak("ממלא את פרטי המוצר המעודכנים.");
      // } else if (!isEditOpen) {
      //   speak("יש לפתוח את טופס עריכת המוצר לפני מילוי שדות.");
    } else {
      speak("יש לפתוח את דף ניהול המוצרים תחילה.");
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
}};

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
