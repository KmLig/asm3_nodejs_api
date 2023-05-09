const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const cors = require('cors');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { upload } = require('../util/multer');

const router = express.Router();


// /admin/add-product => GET
// router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.get('/products/:productId', adminController.getProduct);

router.put('/edit-product/:productId', isAuth, [
    body('name', 'Invalid title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('category', 'Invalid title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('short_desc', 'Invalid title')
        .isString()
        .isLength({ min: 15 })
        .trim(),
    body('long_desc', 'Invalid title')
        .isString()
        .isLength({ min: 30, max: 400 })
        .trim(),
    // body('imageUrl', 'Invalid Url')
    //     .isURL(),
    body('price', 'Invalid Price')
        .isFloat(),
    body('description', 'Invalid description')
        .isLength({ min: 5, max: 400 })
        .trim()
], upload.array('images', 4), adminController.putEditProduct);

router.get('/users', isAuth, adminController.getUsers);

router.post('/add-product', isAuth, [
    body('name', 'Invalid title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('category', 'Invalid title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('short_desc', 'Invalid title')
        .isString()
        .isLength({ min: 15 })
        .trim(),
    body('long_desc', 'Invalid title')
        .isString()
        .isLength({ min: 30, max: 400 })
        .trim(),
    // body('imageUrl', 'Invalid Url')
    //     .isURL(),
    body('price', 'Invalid Price')
        .isFloat(),
    body('description', 'Invalid description')
        .isLength({ min: 5, max: 400 })
        .trim()
], upload.array('images', 4), adminController.addProduct);

// // /admin/add-product => POST
// router.post('/add-product',
//     [
//         body('title', 'Invalid title')
//             .isString()
//             .isLength({ min: 3 })
//             .trim(),
//         // body('imageUrl', 'Invalid Url')
//         //     .isURL(),
//         body('price', 'Invalid Price')
//             .isFloat(),
//         body('description', 'Invalid description')
//             .isLength({ min: 5, max: 400 })
//             .trim()
//     ],
//     isAuth, adminController.postAddProduct);

// router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// router.post('/edit-product',
//     [
//         body('title', 'Invalid title')
//             .isString()
//             .isLength({ min: 3 })
//             .trim(),
//         body('price', 'Invalid price')
//             .isFloat(),
//         body('description', 'Invalid description')
//             .isLength({ min: 5, max: 400 })
//             .trim()
//     ],
//     isAuth, adminController.postEditProduct);

router.delete('/delete-product/:productId', adminController.deleteProduct);

module.exports = router;
