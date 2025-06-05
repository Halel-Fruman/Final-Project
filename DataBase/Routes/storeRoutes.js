const express = require("express");
const Store = require("../models/Stores"); // ייבוא המודל של החנויות
const router = express.Router();
const Products = require("../models/Products");
const UserController = require("../Controllers/userController"); // קובץ חדש לשליטה בלוגיקה של משתמשים
const User = require("../models/User");
const authenticateToken = require("../Middleware/authenticateToken");
const authorizeStoreAccess = require("../Middleware/authorizeStoreAccess");


// נתיב לשליפת כל החנויות
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find(); // שליפת כל החנויות מה-DB
    res.status(200).json(stores); // החזרת החנויות ב-json
  } catch (error) {
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

const updateUserRole = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.role = role;
  await user.save();
  return user;
};
router.post("/", async (req, res) => {
  const { name, address, email, manager, deliveryOptions, about } = req.body;

  try {
    const newStore = new Store({
      name,
      address,
      email,
      about,
      manager,
      deliveryOptions: {
        homeDelivery: {
          company: deliveryOptions?.homeDelivery?.company || "",
          price: deliveryOptions?.homeDelivery?.price || 0,
        },
      },
    });

    await newStore.save();

    for (const item of manager) {
      const user = await User.findOne({ email: item.emailAddress });
      if (user) {
        await updateUserRole(user._id, "storeManager");
      } else {
        console.warn("User not found for email:", item.emailAddress);
      }
    }

    const newStoreProducts = new Products({
      storeId: newStore._id, // קישור לחנות
      storeName: {
        he: newStore.name.he,
        en: newStore.name.en,
      },
     
      products: [], 
    });

    await newStoreProducts.save();


    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error adding store:", error.message);
    res.status(500).json({ message: "שגיאה בהוספת החנות" });
  }
});



router.put("/:id", authenticateToken, authorizeStoreAccess, async (req, res) => {
  const { name, address, email, manager, deliveryOptions,about } = req.body;

  try {
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      {
        name,
        address,
        email,
	about,
        manager,
        deliveryOptions: {
          homeDelivery: {
            company: deliveryOptions?.homeDelivery?.company || "",
            price: deliveryOptions?.homeDelivery?.price || 0,
          },
                  },
      },
      { new: true }
    );

    res.status(200).json(updatedStore);
  } catch (error) {
    res.status(500).json({ error: "Error updating store: " + error.message });
  }
});

// נתיב למחיקת חנות
router.delete("/:id",authenticateToken, authorizeStoreAccess, async (req, res) => {
  const { id } = req.params; // מזהה החנות שברצוננו למחוק

  try {
    const deletedStore = await Store.findByIdAndDelete(id);
    if (!deletedStore)
      return res.status(404).json({ message: "חנות לא נמצאה" });
    res.status(200).json({ message: "החנות נמחקה בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "שגיאה במחיקת החנות" });
  }
});

// חיפוש חנות לפי ID
router.get("/:id",authenticateToken, authorizeStoreAccess, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: "Error fetching store: " + error.message });
  }
});


router.get("/:id/shipping-info", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id, "deliveryOptions");
    if (!store)
      return res.status(404).json({ error: "Store not found" });

    res.status(200).json(store.deliveryOptions || {});
  } catch (error) {
    console.error("Error fetching shipping info:", error.message);
    res.status(500).json({ error: "Failed to fetch shipping info" });
  }
});
module.exports = router; // ייצוא הנתיב
