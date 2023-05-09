const crypto = require('crypto');

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID
  }
}));

exports.postSignin = async (req, res, next) => {

  const { email, password } = req.query;
  console.log(req.query);
  const errors = validationResult(req);
  try {
    const user = await User.findOne({ email: email });
    console.log(user);
    if (!user) {
      const error = new Error('User with this email can be found.');
      error.statusCode = 401; //401 not auth or can 404 be used
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password.');
      error.statusCode = 401;
      throw error;
    }
    // res.setHeader('Set-Cookie', 'logedIn=true');
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;

    const token = jwt.sign({
      _id: user._id.toString(),
      role: user.role
    }, 'dicoshop',
      {
        expiresIn: '2 days'
      }
    );
    // console.log('token', token);
    res
      .status(200)
      .cookie('access_token', token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: false,
        sameSite: 'none',
        secure: true
      })
      .json({ message: 'login success', userId: user._id.toString(), fullName: user.fullName, role: user.role });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  const { email, password, fullName, phone } = req.query;
  const errors = validationResult(req);
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    email: email,
    password: hashedPassword,
    fullName: fullName,
    phone: phone,
    role: 'user',
    cart: {
      items: []
    }
  });
  const result = await user.save();
  res.status(200).json({ message: 'created user', result: result });
};

exports.getDetailData = async (req, res, next) => {
  const user = await User.findById(req._id);
  console.log(user);
  res.status(200).json({ message: 'fetch name', fullName: user.fullName });
};




exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with this email found!');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'soundofthewind1102@gmail.com',
          subject: 'Password reset!',
          html: `
            <p>You requested a password reset!</p>
            <p>Click this <a href="http://localhost:3002/reset/${token}">link</a> to set a new password!</p>
          `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewpassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
