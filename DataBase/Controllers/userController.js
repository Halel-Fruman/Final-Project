const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

const UserController = {
  login: async (req, res) => {
    const { email, password } = req.body;
    console.log(email);

    try {
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) return res.status(404).send("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).send("Invalid credentials");

      const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
      res.status(200).json({ token, userId: user._id });
    } catch (error) {
      res.status(500).send("Error logging in: " + error.message);
    }
  },

  getUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
      }
      console.log(`User found: ${user}`);
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error.message);
      res.status(500).json({ error: "Error fetching user: " + error.message });
    }
  },

  editUser: async (req, res) => {
    const { userId } = req.params;
    const updatedFields = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      // עדכן את השדות שנשלחו
      Object.keys(updatedFields).forEach((field) => {
        user[field] = updatedFields[field];
      });

      await user.save();
      res.status(200).json(user); // החזר את הנתונים המעודכנים
    } catch (error) {
      res.status(500).send("Error updating user: " + error.message);
    }
  },

  changePassword: async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).send("Current password is incorrect");

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).send("Error changing password: " + error.message);
    }
  },

  addAddress: async (req, res) => {
    const { userId } = req.params;
    const { address } = req.body;
    console.log("params", req.params);
    console.log("body", req.body);

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      user.addresses.push(address);
      await user.save();

      res.status(200).json(user.addresses);
    } catch (error) {
      res.status(500).send("Error adding address: " + error.message);
    }
  },

  updateAddresses: async (req, res) => {
    const { userId } = req.params;
    const { addresses } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      user.addresses = addresses;
      await user.save();

      res.status(200).json(user.addresses);
    } catch (error) {
      res.status(500).send("Error updating addresses: " + error.message);
    }
  },

  deleteAddress: async (req, res) => {
    const { userId } = req.params;
    const { index } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      if (!user.addresses[index])
        return res.status(400).send("Address not found");

      user.addresses.splice(index, 1);
      await user.save();

      res.status(200).json(user.addresses);
    } catch (error) {
      res.status(500).send("Error deleting address: " + error.message);
    }
  },

  register: async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    console.log(req.body);

    try {
      // בדוק אם משתמש עם אותו אימייל כבר קיים
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // יצירת משתמש חדש עם סיסמה מוצפנת
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        addresses: [],
      });

      await newUser.save();

      res
        .status(201)
        .json({ message: "User registered successfully", userId: newUser._id });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error registering user: " + error.message });
    }
  },
  addToWishlist: async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const alreadyInWishlist = user.wishlist.some(
        (item) => item.productId.toString() === productId
      );

      if (alreadyInWishlist) {
        return res
          .status(400)
          .json({ error: "Product is already in the wishlist" });
      }

      user.wishlist.push({ productId });
      await user.save();

      res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error adding product to wishlist: " + error.message });
    }
  },

  getWishlist: async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId).populate({
        path: "wishlist.productId",
        model: "Example_products",
        select: "name price picture",
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      res.status(200).json(user.wishlist);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error fetching wishlist: " + error.message });
    }
  },

  removeFromWishlist: async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.wishlist = user.wishlist.filter(
        (item) => item.productId.toString() !== productId
      );
      await user.save();

      res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Error removing product from wishlist: " + error.message,
        });
    }
  },
};

module.exports = UserController;
