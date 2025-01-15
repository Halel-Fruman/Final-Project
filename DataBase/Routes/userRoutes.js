const express = require('express');
const UserController = require('../Controllers/userController'); // קובץ חדש לשליטה בלוגיקה של משתמשים
const authenticateToken = require('../Middleware/authenticateToken'); // ייבוא המידלוור

const router = express.Router();

//  login
router.post('/login', UserController.login);

// register
router.post('/register', UserController.register);

// get user
router.get('/:userId', UserController.getUser);

// edit
router.put('/:userId/edit', UserController.editUser);

// change password
router.put('/:userId/change-password', UserController.changePassword);

//add address
router.post('/:userId/add-address', UserController.addAddress);

// update addresses
router.put('/:userId/update-addresses', UserController.updateAddresses);

// delete address
router.delete('/:userId/delete-address', UserController.deleteAddress);

// add to wishlist
router.post('/:userId/wishlist', UserController.addToWishlist);
// get wishlist
router.get('/:userId/wishlist', UserController.getWishlist);
// remove from wishlist
router.delete('/:userId/wishlist', UserController.removeFromWishlist);

module.exports = router;
