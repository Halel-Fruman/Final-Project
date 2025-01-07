const express = require('express');
const UserController = require('../Controllers/userController'); // קובץ חדש לשליטה בלוגיקה של משתמשים
const router = express.Router();

//  login
router.post('/login', UserController.login);

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

module.exports = router;
