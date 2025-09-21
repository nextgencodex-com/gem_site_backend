const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');

// POST: Save any order data
router.post('/', createOrder);

// GET: Retrieve all orders
router.get('/', getOrders);

module.exports = router;