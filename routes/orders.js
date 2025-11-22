const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/', authenticateToken, async (req, res) => {
);

router.post('/', authenticateToken, async (req, res) => {
   );