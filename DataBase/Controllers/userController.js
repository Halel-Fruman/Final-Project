const bcrypt = require("bcrypt");
const User = require("../models/User");
const StoreProducts = require("../models/Products"); // נתיב למודל המוצרים
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

const UserController = {
  verifyToken: (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Invalid token:", err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      res.status(200).json({ message: "Token is valid", userId: decoded.id });
    });
  },
  ////

  // UserController.js

  // קבלת כל המשתמשים
  getUsers: async (req, res) => {
    try {
      const users = await User.find(); // מחפש את כל המשתמשים
      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users: " + error.message });
    }
  },

  // קבלת פרטי משתמש ספציפי
  getUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user: " + error.message });
    }
  },

  // עריכת פרטי משתמש
  editUser: async (req, res) => {
    const { userId } = req.params;
    const updatedFields = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      // עדכון שדות ספציפיים
      Object.keys(updatedFields).forEach((field) => {
        user[field] = updatedFields[field];
      });

      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send("Error updating user: " + error.message);
    }
  },

  // שינוי רול של משתמש
  changeRole: async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      user.role = role; // עדכון הרול של המשתמש
      await user.save();

      res.status(200).json(user); // החזרת המשתמש המעודכן
    } catch (error) {
      res.status(500).send("Error updating user role: " + error.message);
    }
  },

  // פונקציות נוספות כאן (כמו changePassword, addAddress וכו')

  ///////

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
      res.status(200).json({ token, userId: user._id, role: user.role });
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
  getUsers: async (req, res) => {
    try {
      const users = await User.find(); // מחפש את כל המשתמשים
      if (!users || users.length === 0) {
        console.log("No users found");
        return res.status(404).json({ error: "No users found" });
      }
      console.log(`Users found: ${users.length}`);
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: "Error fetching users: " + error.message });
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
    const { email, password, phoneNumber, first_name, last_name } = req.body;
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
        phoneNumber,
        first_name,
        last_name,
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
        (item) => String(item.productId) === String(productId)
      );

      if (alreadyInWishlist) {
        return res
          .status(400)
          .json({ error: "Product is already in the wishlist" });
      }

      const store = await StoreProducts.findOne({ "products._id": productId });
      if (!store) {
        return res.status(404).json({ error: "Product not found" });
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
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const populatedWishlist = await Promise.all(
        user.wishlist.map(async (item) => {
          const store = await StoreProducts.findOne({
            "products._id": item.productId,
          });
          if (!store) return null;

          const product = store.products.find(
            (product) => String(product._id) === String(item.productId)
          );

          if (!product) return null;

          return {
            ...item.toObject(),
            productDetails: {
              name: product.name,
              price: product.price,
              image: product.images[0],
              storeId: store._id,
              storeName: store.storeName,
            },
          };
        })
      );

      res.status(200).json(populatedWishlist.filter(Boolean));
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
      res.status(500).json({
        error: "Error removing product from wishlist: " + error.message,
      });
    }
  },

  addToCart: async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const existingCartItem = user.cart.find(
        (item) => String(item.productId) === productId
      );

      if (existingCartItem) {
        existingCartItem.quantity += quantity;
      } else {
        user.cart.push({ productId, quantity });
      }

      await user.save();
      res.status(200).json({ cart: user.cart });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error adding product to cart: " + error.message });
    }
  },

  getCart: async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // טעינת פרטי כל המוצרים מהעגלה
      const detailedCart = await Promise.all(
        user.cart.map(async (item) => {
          const store = await StoreProducts.findOne({
            "products._id": item.productId,
          });

          if (!store) {
            console.warn(`Store not found for productId: ${item.productId}`);
            return null; // התעלמות מפריטים שלא נמצאו
          }

          // מציאת המוצר הספציפי תחת החנות
          const product = store.products.find(
            (product) => String(product._id) === String(item.productId)
          );

          if (!product) {
            console.warn(`Product not found for productId: ${item.productId}`);
            return null; // התעלמות מפריטים חסרים
          }

          return {
            ...item.toObject(),
            productDetails: product,
            storeId: store._id,
            storeName: store.storeName,
          };
        })
      );

      // סינון פריטים לא תקינים
      const filteredCart = detailedCart.filter((item) => item !== null);

      res.status(200).json(filteredCart);
    } catch (error) {
      console.error("Error fetching cart:", error.message);
      res.status(500).json({ error: "Error fetching cart: " + error.message });
    }
  },

  removeFromCart: async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.cart = user.cart.filter(
        (item) => item.productId.toString() !== productId
      );
      await user.save();

      res.status(200).json(user.cart);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error removing product from cart: " + error.message });
    }
  },

  updateCartQuantity: async (req, res) => {
    const { userId } = req.params;
    const { cartItems } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.cart = cartItems; // עדכון עגלה חדשה לחלוטין
      await user.save();

      res.status(200).json(user.cart);
    } catch (error) {
      res.status(500).json({ error: "Error updating cart: " + error.message });
    }
  },
};

module.exports = UserController;
