const express = require('express');

const orderController = require('../controllers/order');
const isAuth = require('../middleware/is-auth');

const router = express.Router();



// router.get('/', shopController.getIndex);

router.post('/email', isAuth, orderController.order);

router.get('/histories', isAuth, orderController.histories);

router.get('/histories/all', isAuth, orderController.allHistories);

router.get('/histories/:orderId', isAuth, orderController.detailHistories);

// router.get('/:productId', shopController.getProduct);

// router.get('/cart', isAuth, shopController.getCart);

// router.post('/carts/add', isAuth, shopController.addCart);

// router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

// router.get('/checkout', isAuth, shopController.getCheckout);

// router.get('/checkout/success', shopController.getCheckoutSuccess);

// router.get('/checkout/cancel', shopController.getCheckout);

// // router.post('/create-order', isAuth, shopController.postOrder);

// router.get('/orders', isAuth, shopController.getOrders);

// router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
