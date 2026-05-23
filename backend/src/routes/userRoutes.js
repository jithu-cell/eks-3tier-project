const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
    getUsers, getUserById, createUser, updateUser, deleteUser
} = require('../controllers/userController');

router.use(authMiddleware); // ALL routes below require valid JWT

router.get('/', getUsers);               // any logged-in user
router.get('/:id', getUserById);            // any logged-in user
router.post('/', adminOnly, createUser);  // admin only
router.put('/:id', adminOnly, updateUser);  // admin only
router.delete('/:id', adminOnly, deleteUser); // admin only

module.exports = router;