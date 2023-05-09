const express = require('express');

const cartController = require('../controllers/cart');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// const isAuth = require('../middleware/is-auth');

// router.get('/', shopController.getIndex);

// router.get('/', shopController.getProducts);

// router.get('/:productId', shopController.getProduct);

router.get('/', isAuth, cartController.getCart);

router.post('/add', isAuth, cartController.addCart);

router.put('/update', isAuth, cartController.updateCart);

router.delete('/delete', isAuth, cartController.deleteProduct);

// router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

// router.get('/checkout', isAuth, shopController.getCheckout);

// router.get('/checkout/success', shopController.getCheckoutSuccess);

// router.get('/checkout/cancel', shopController.getCheckout);

// // router.post('/create-order', isAuth, shopController.postOrder);

// router.get('/orders', isAuth, shopController.getOrders);

// router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
