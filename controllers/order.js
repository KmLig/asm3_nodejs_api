// const fs = require('fs');
// const path = require('path');
// const stripe = require('stripe')('sk_test_51Mi6L4B6bzNsXPsRCInzCYbCCcLHxpKsXwkjHO1sg8ueVT8AhRgQJxMmhvp1XzcMPKqGKocUhj97X4b8BeBWvnqr00RsBIbpDQ');

// const PDFDocument = require('pdfkit');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const convertMoney = require('../util/convertMoney');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID
  }
}));




exports.order = async (req, res, next) => {
  // console.log(req.get('Cookie'));
  console.log(req.query);
  const { to, fullname, phone, address, idUser } = req.query;
  const user = await User.findById(req.userId);
  let result;
  let removeCart;
  if (user._id.toString() === req.userId) {
    const order = new Order({
      userId: user._id,
      cart: user.cart,
      email: to,
      fullName: fullname,
      phone: phone,
      address: address,
      delivery: false,
      status: false
    });
    result = await (await order.save()).populate('cart.items.productId');
    removeCart = await user.clearCart();

    let sub_total = 0;

    const sum_total = result.cart.items.map((item) => {
      return (sub_total +=
        parseInt(item.productId.price) * parseInt(item.quantity));
    });


    transporter.sendMail({
      to: to,
      from: 'phochieumotminh@gmail.com',
      subject: 'Place order successfully!',
      html: `
      <h1>Xin chào ${fullname}</h1>
      <h4>Phone: ${phone}</h4>
      <h4>Address: ${address}</h4>
      <table border="1">
          <tr>
              <th>Tên sản phẩm</th>
              <th>Hình ảnh</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
          </tr>
          ${result.cart.items.map((i) => {
        return (
          `
          <tr>
              <th>${i.productId.name}</th>
              <th><img src="${i.productId.img1}" alt="" style="width:50px;height:50px;object-fit:cover;"></th>
              <th>${convertMoney(i.productId.price)} VND</th>
              <th>${i.quantity}</th>
              <th>${convertMoney(i.quantity * i.productId.price)} VND</th>
          </tr>
          `
        );
      })}
      </table>
      <h3>Tổng thanh toán ${convertMoney(sub_total)} VND</h3>
      <h4><i>Cảm ơn bạn</i></h4>
      <h4><i>Km Mobile shop</i></h4>
      `
    });
  }
  // const totalItems = await Product.find().countDocuments();
  // const products = await Product.find();
  res.status(200).json({ message: 'place order', result: result });
};

exports.histories = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId }).populate('cart.items.productId');
    if (!orders) {
      const error = new Error('Cound not find history');
      error.statusCode = 404;
      throw error;
    }

    const sendOrders = orders.map((order) => {
      let sub_total = 0;
      const sum_total = order.cart.items.map((item) => {
        return (sub_total +=
          parseInt(item.productId.price) * parseInt(item.quantity));
      });
      console.log(sub_total);
      return {
        ...order._doc,
        total: sub_total
      };
    });

    res.status(200).json({ message: 'fetch histories', histories: sendOrders });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.allHistories = async (req, res, next) => {
  try {
    if (req.role !== 'admin') {
      console.log(req.role);
      const error = new Error('Not authorized!');
      error.statusCode = 401; //401 not auth or can 404 be used
      throw error;
    }
    const orders = await Order.find().populate('cart.items.productId');
    const sendOrders = orders.map((order) => {
      let sub_total = 0;
      const sum_total = order.cart.items.map((item) => {
        return (sub_total +=
          parseInt(item.productId.price) * parseInt(item.quantity));
      });
      return {
        ...order._doc,
        total: sub_total
      };
    });
    res.status(200).json({ message: 'fetch histories', histories: sendOrders });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.detailHistories = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('cart.items.productId');
    if (!order) {
      error = new Error('Cound not find detail history');
      error.statusCode = 404;
      throw error;
    }

    let sub_total = 0;
    const sum_total = order.cart.items.map((item) => {
      return (sub_total +=
        parseInt(item.productId.price) * parseInt(item.quantity));
    });
    console.log(sub_total);
    res.status(200).json({ message: 'fetch histories', detailHistories: { ...order._doc, total: sub_total } });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};





// exports.postOrder = (req, res, next) => {
  //   req.user
  //     .populate('cart.items.productId')
  //     .then(user => {
  //       const products = user.cart.items.map(i => {
  //         return { quantity: i.quantity, product: { ...i.productId._doc } };
  //       });
  //       const order = new Order({
  //         user: {
  //           email: req.user.email,
  //           userId: req.user
  //         },
  //         products: products
  //       });
  //       return order.save();
  //     })
  //     .then(result => {
  //       return req.user.clearCart();
  //     })
  //     .then(() => {
  //       res.redirect('/orders');
  //     })
  //     .catch(err => {
  //       const error = new Error(err);
  //       error.httpStatusCode = 500;
  //       return next(error);
  //     });
  // };
