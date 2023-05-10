const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');



router.post('/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email!')
            .normalizeEmail(),
        body('password', 'Password has to be valid!')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()

    ], authController.postSignin);

router.post('/logout', authController.postLogout);


router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email!')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then((userDoc) => {
                        if (userDoc) {
                            return Promise.reject('Email exists already, please choose a different one!');
                        }
                    });
            })
            .normalizeEmail(),
        body('password', 'Please enter a password with numbers and text and at least 5 characters!')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match!');
                }
                return true;
            })
    ], authController.signup);

router.get('/:userId', isAuth, authController.getDetailData);

// router.get('/reset', authController.getReset);

// router.post('/reset', authController.postReset);

// router.get('/reset/:token', authController.getNewPassword);

// router.post('/new-password', authController.postNewpassword);

module.exports = router;