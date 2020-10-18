const express = require('express');
const router = express.Router();
const { create, list, read, remove, image, trending } = require('../controllers/category');

// validators
// const { runValidation } = require('../validators');
// const { categoryCreateValidator } = require('../validators/category');
const { requireSignin, adminMiddleware } = require('../controllers/auth');

router.post('/category', requireSignin, adminMiddleware, create);
router.get('/categories', list);
router.get('/category/:slug', read);
router.get('/category/image/:slug', image);
router.get('/category/top/:slug', trending);
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);

module.exports = router;