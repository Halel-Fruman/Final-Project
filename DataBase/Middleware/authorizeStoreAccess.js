const Store = require("../models/Stores");
const User = require("../models/User");

const authorizeStoreAccess = async (req, res, next) => {
  const userId = req.user.userId;
  const storeId = req.params.id;
  try {
    const user = await User.findById(userId);
    const store = await Store.findById(storeId);
    if (!user || !store) {
      return res.status(404).json({ error: "User or store not found" });
    }

    const isAdmin = user.role === "admin";
    const isStoreManager = store.manager.some(
      (m) => m.emailAddress.trim().toLowerCase() === user.email.trim().toLowerCase()
    );

    if (!isAdmin && !isStoreManager) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (err) {
    console.error("Authorization error:", err.message);
    res.status(500).json({ error: "Internal server error during authorization" });
  }
};

module.exports = authorizeStoreAccess;
