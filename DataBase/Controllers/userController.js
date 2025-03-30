const bcrypt = require("bcrypt");
const User = require("../models/User");
const StoreProducts = require("../models/Products");
const jwt = require("jsonwebtoken"); // import jwt
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key"; // set the secret key

// UserController.js
const UserController = {
  // verifyToken function to check if the token is valid
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

  // get all users from the database
  getUsers: async (req, res) => {
    try {
      const users = await User.find();
      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users: " + error.message });
    }
  },

  // get a specific user by id
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

  // edit a user by id and update the fields
  editUser: async (req, res) => {
    const { userId } = req.params;
    const updatedFields = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      Object.keys(updatedFields).forEach((field) => {
        user[field] = updatedFields[field];
      });

      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send("Error updating user: " + error.message);
    }
  },

  // change the role of a user by id
  changeRole: async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      user.role = role;
      await user.save();

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send("Error updating user role: " + error.message);
    }
  },

  ///////

  //  login function to authenticate the user
  login: async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    // find the user by email
    try {
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) return res.status(404).send("User not found");
      // compare the password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).send("Invalid credentials");
      // create a token with the user id
      const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
      res.status(200).json({ token, userId: user._id, role: user.role });
    } catch (error) {
      res.status(500).send("Error logging in: " + error.message);
    }
  },
  //
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
      const users = await User.find();
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

      Object.keys(updatedFields).forEach((field) => {
        user[field] = updatedFields[field];
      });

      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send("Error updating user: " + error.message);
    }
  },

  // change the role of a user by id
  changePassword: async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    // find the user by id
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

  // add an address to a user by id
  addAddress: async (req, res) => {
    const { userId } = req.params;
    const { address } = req.body;

    console.log("params", req.params);
    console.log("body", req.body);

    // Basic validation
    if (!address || !address.city || !address.streetAddress) {
      return res.status(400).json({
        message: "Missing city or streetAddress in address object",
      });
    }

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");

      user.addresses.push({
        city: address.city,
        streetAddress: address.streetAddress,
      });

      await user.save();

      res.status(200).json(user.addresses);
    } catch (error) {
      res.status(500).send("Error adding address: " + error.message);
    }
  },
  updateAddresses: async (req, res) => {
    const { userId } = req.params;
    const { addresses } = req.body;

    if (!Array.isArray(addresses)) {
      return res.status(400).send("Addresses should be an array");
    }

    const isValid = addresses.every((addr) => addr.city && addr.streetAddress);

    if (!isValid) {
      return res
        .status(400)
        .send("Each address must have 'city' and 'streetAddress'");
    }

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

      if (
        typeof index !== "number" ||
        index < 0 ||
        index >= user.addresses.length
      ) {
        return res.status(400).send("Invalid address index");
      }

      user.addresses.splice(index, 1);
      await user.save();

      res.status(200).json(user.addresses);
    } catch (error) {
      res.status(500).send("Error deleting address: " + error.message);
    }
  },
  // register a new user
  register: async (req, res) => {
    const { email, password, phoneNumber, first_name, last_name } = req.body;
    console.log(req.body);

    try {
      // check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // hash the password before saving the user
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
  // add a product to the wishlist of a user by id
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
      // find the product in the store
      const store = await StoreProducts.findOne({ "products._id": productId });
      if (!store) {
        return res.status(404).json({ error: "Product not found" });
      }
      // add the product to the wishlist
      user.wishlist.push({ productId });
      await user.save();

      res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error adding product to wishlist: " + error.message });
    }
  },
  // get the wishlist of a user by id
  getWishlist: async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // populate the wishlist with the product details
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
              quantity: product.stock,
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
  // remove a product from the wishlist of a user by id
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
  // add a product to the cart of a user by id
  addToCart: async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    // find the user by id
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      // check if the product is already in the cart
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
  // get the cart of a user by id
  getCart: async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const detailedCart = await Promise.all(
        user.cart.map(async (item) => {
          const store = await StoreProducts.findOne({
            "products._id": item.productId,
          });

          if (!store) {
            console.warn(`Store not found for productId: ${item.productId}`);
            return null;
          }

          const product = store.products.find(
            (product) => String(product._id) === String(item.productId)
          );

          if (!product) {
            console.warn(`Product not found for productId: ${item.productId}`);
            return null;
          }

          return {
            ...item.toObject(),
            productDetails: product,
            storeId: store._id,
            storeName: store.storeName,
          };
        })
      );

      const filteredCart = detailedCart.filter((item) => item !== null);

      res.status(200).json(filteredCart);
    } catch (error) {
      console.error("Error fetching cart:", error.message);
      res.status(500).json({ error: "Error fetching cart: " + error.message });
    }
  },

  // remove a product from the cart of a user by id
  removeFromCart: async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;
    // find the user by id
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

  // update the quantity of a product in the cart of a user by id
  updateCartQuantity: async (req, res) => {
    const { userId } = req.params;
    const { cartItems } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.cart = cartItems;
      await user.save();

      res.status(200).json(user.cart);
    } catch (error) {
      res.status(500).json({ error: "Error updating cart: " + error.message });
    }
  },

   addTransactionToUser : async (req, res) => {
    const { userId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.transactions.push(transactionId);
      await user.save();

      res.status(200).json({ message: "Transaction added to user", transactions: user.transactions });
    } catch (error) {
      res.status(500).json({ message: "Error adding transaction to user", error: error.message });
    }
  },
};

module.exports = UserController;
