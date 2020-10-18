const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove, image } = require('../controllers/tag');

// validators
// const { runValidation } = require('../validators');
// const { createTagValidator } = require('../validators/tag');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/tag', requireSignin, adminMiddleware, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
router.get('/tag/image/:slug', image);
router.delete('/tag/:slug', requireSignin, adminMiddleware, remove);

module.exports = router; 