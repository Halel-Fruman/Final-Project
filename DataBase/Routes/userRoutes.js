const express = require("express");
const UserController = require("../Controllers/userController"); 
const authenticateToken = require("../Middleware/authenticateToken");
const router = express.Router();

router.post("/refresh-token", UserController.refreshTokenHandler);

//  login
router.post("/login", UserController.login);

router.post("/logout", UserController.logoutHandler);


//clear cart
router.put('/:id/clear-cart', authenticateToken, UserController.clearUserCart);

// register
router.post("/register", UserController.register);
// verify token
router.get("/verify-token", UserController.verifyToken);

router.put(
  "/:userId/change-role",
  authenticateToken,
  UserController.changeRole
);


// get user
router.get("/:userId", authenticateToken, UserController.getUser);

//get all users
router.get("/", authenticateToken, UserController.getUsers);

// edit
router.put("/:userId/edit", authenticateToken, UserController.editUser);

// delete user 
router.delete("/:userId",authenticateToken,UserController.deleteUser);


// change password
router.put(
  "/:userId/change-password",
  authenticateToken,
  UserController.changePassword
);

//add address
router.post(
  "/:userId/add-address",
  authenticateToken,
  UserController.addAddress
);

// update addresses
router.put(
  "/:userId/update-addresses",
  authenticateToken,
  UserController.updateAddresses
);

// delete address
router.delete(
  "/:userId/delete-address",
  authenticateToken,
  UserController.deleteAddress
);

// add to wishlist
router.post(
  "/:userId/wishlist",
  authenticateToken,
  UserController.addToWishlist
);
// get wishlist
router.get("/:userId/wishlist", authenticateToken, UserController.getWishlist);
// remove from wishlist
router.delete(
  "/:userId/wishlist",
  authenticateToken,
  UserController.removeFromWishlist
);
// add to cart
router.post("/:userId/cart", UserController.addToCart);
// get cart
router.get("/:userId/cart", UserController.getCart);
// update cart quantity
router.put("/:userId/cart", UserController.updateCartQuantity);
router.patch("/:userId/cart/update-quantity", UserController.updateCartItemQuantity);

// remove from cart
router.delete("/:userId/cart", UserController.removeFromCart);

router.post("/:userId/add-transaction", UserController.addTransactionToUser);

module.exports = router;
