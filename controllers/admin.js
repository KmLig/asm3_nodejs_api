const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
// const fileHelper = require('../util/file');

const { validationResult } = require('express-validator');

const Product = require('../models/product');
const User = require('../models/user');


exports.getProducts = async (req, res, next) => {
  // console.log(req.get('Cookie'));   
  try {
    if (req.role !== 'admin') {
      console.log(req.userRole);
      const error = new Error('Not authorized!');
      error.statusCode = 401; //401 not auth or can 404 be used
      throw error;
    }
    // const totalItems = await Product.find().countDocuments();
    const products = await Product.find();
    res.status(200).json({ message: 'fetch products', products: products });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error('Could not find product');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'fetch product details', product: product });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putEditProduct = async (req, res, next) => {
  if (req.role !== 'admin') {
    const error = new Error('Not authorized!');
    error.statusCode = 401; //401 not auth or can 404 be used
    throw error;
  }
  let imageArray;
  if (req.files) {
    imageArray = req.files.map(file => {
      return file.path.replace("\\", "/");
    });
  }
  if (imageArray.length !== 4) {
    const err = new Error('Choose 4 pics for this product');
    err.statusCode = 422;
    throw err;
  }
  const errors = validationResult(req);
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      const error = new Error('Could not find product');
      error.statusCode = 404;
      throw error;
    }
    console.log('edit', product);
    for (let i = 1; i < 5; i++) {
      console.log(product[`img${i}`]);
      clearImage(product[`img${i}`]);
    }

    product.name = req.body.name;
    product.category = req.body.category;
    product.long_desc = req.body.long_desc;
    product.short_desc = req.body.short_desc;
    product.price = req.body.price;
    product.img1 = imageArray[0];
    product.img2 = imageArray[1];
    product.img3 = imageArray[2];
    product.img4 = imageArray[3];


    const result = await product.save();
    res.status(200).json({ message: 'edit product', result: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

};

exports.getUsers = async (req, res, next) => {
  try {
    if (req.role !== 'admin') {
      const error = new Error('Not authorized!');
      error.statusCode = 401; //401 not auth or can 404 be used
      throw error;
    }
    const users = await User.find();
    res.status(200).json({ message: 'fetch users', users: users });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addProduct = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //     const error = new Error('Validation failed, entered data is incorrect.');
  //     error.statusCode = 422;
  //     throw error;
  // }
  // const imageUrl = req.file.path.replace("\\", "/");
  // console.log('imageUrl', imageUrl);
  // if (!req.file) {
  //   const error = new Error('No image provided!');
  //   error.statusCode = 422;
  //   throw error;
  // }
  try {
    if (req.role !== 'admin') {
      const error = new Error('Not authorized!');
      error.statusCode = 401; //401 not auth or can 404 be used
      throw error;
    }

    console.log('req files', req.files);
    const imageArray = req.files.map(file => {
      return file.path.replace("\\", "/");
    });
    console.log(imageArray);
    console.log('req body', req.body);
    const product = new Product();
    product.name = req.body.name;
    product.category = req.body.category;
    product.long_desc = req.body.long_desc;
    product.short_desc = req.body.short_desc;
    product.price = req.body.price;
    product.img1 = imageArray[0];
    product.img2 = imageArray[1];
    product.img3 = imageArray[2];
    product.img4 = imageArray[3];

    const result = await product.save();
    res.status(201).json({ message: 'Product created', result: result });
    // res.status(201).json({ message: 'Product created' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

  // const { title, content } = req.body;
  // // Create post in db
  // const post = new Post({
  //   title: title,
  //   content: content,
  //   imageUrl: imageUrl,
  //   creator: req.userId
  // });
  // try {
  //   await post.save();
  //   const user = await User.findById(req.userId);
  //   user.posts.push(post);
  //   await user.save();
  //   io.getOI().emit('posts', {
  //     action: 'create',
  //     post: {
  //       ...post._doc,
  //       creator: { _id: user._id, name: user.name }
  //     }
  //   });
  //   res.status(201).json({
  //     message: 'Post created successfully!',
  //     post: post,
  //     creator: { _id: user._id, name: user.name }
  //   });
  // } catch (err) {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};


exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  console.log(productId);
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 500;
      throw error;
    }
    // Check logged in user
    for (let i = 1; i < 5; i++) {
      console.log(product[`img${i}`]);
      clearImage(product[`img${i}`]);
    }
    const result = await Product.findByIdAndDelete(productId);



    // io.getOI().emit('posts', {
    //   action: 'delete',
    //   post: postId
    // });
    res.status(200).json({ message: 'Deleted post.', result: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// exports.getAddProduct = (req, res, next) => {
//   res.render('admin/edit-product', {
//     pageTitle: 'Add Product',
//     path: '/admin/add-product',
//     editing: false,
//     hasError: false,
//     errorMessage: null,
//     validationErrors: []
//   });
// };

// exports.postAddProduct = (req, res, next) => {
//   const { title, price, description } = req.body;
//   const image = req.file;
//   const errors = validationResult(req);
//   if (!image) {
//     res.status(422).render('admin/edit-product', {
//       pageTitle: 'Add Product',
//       path: '/admin/add-product',
//       editing: false,
//       hasError: true,
//       errorMessage: 'Attached file is not an image.',
//       product: {
//         title: title,
//         price: price,
//         description: description
//       },
//       validationErrors: []
//     });
//   }
//   console.log(image);

//   const imageUrl = image.path;

//   if (!errors.isEmpty()) {
//     return res.status(422).render('admin/edit-product', {
//       pageTitle: 'Add Product',
//       path: '/admin/add-product',
//       editing: false,
//       hasError: true,
//       errorMessage: errors.array()[0].msg,
//       product: {
//         title: title,
//         price: price,
//         description: description
//       },
//       validationErrors: errors.array()
//     });
//   }

//   const product = new Product({
//     // _id: new mongoose.Types.ObjectId('63d53461589db958e686b603'), // test for Db operation fails
//     title: title,
//     price: price,
//     description: description,
//     imageUrl: imageUrl,
//     userId: req.user
//   });
//   product
//     .save()
//     .then(result => {
//       console.log('Created Product');
//       res.redirect('/admin/products');
//     })
//     .catch(err => {
//       // return res.status(500).render('admin/edit-product', {
//       //   pageTitle: 'Add Product',
//       //   path: '/admin/add-product',
//       //   editing: false,
//       //   hasError: true,
//       //   errorMessage: 'Database operation failed, please try again.',
//       //   product: {
//       //     title: title,
//       //     imageUrl: imageUrl,
//       //     price: price,
//       //     description: description
//       //   },
//       //   validationErrors: []
//       // });
//       // return res.redirect('/500');
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;
//   if (!editMode) {
//     return res.redirect('/');
//   }
//   const prodId = req.params.productId;
//   Product.findById(prodId)
//     .then(product => {
//       //throw new Error('Dummy'); //test for catch block
//       if (!product) {
//         return res.redirect('/');
//       }
//       res.render('admin/edit-product', {
//         pageTitle: 'Edit Product',
//         path: '/admin/edit-product',
//         editing: editMode,
//         product: product,
//         hasError: false,
//         errorMessage: null,
//         validationErrors: []
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedPrice = req.body.price;
//   const image = req.file;
//   const updatedDesc = req.body.description;

//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(422).render('admin/edit-product', {
//       pageTitle: 'Edit Product',
//       path: '/admin/edit-product',
//       editing: true,
//       hasError: true,
//       errorMessage: errors.array()[0].msg,
//       product: {
//         _id: prodId,
//         title: updatedTitle,
//         price: updatedPrice,
//         description: updatedDesc
//       },
//       validationErrors: errors.array()
//     });
//   }

//   Product.findById(prodId)
//     .then(product => {
//       if (product.userId.toString() !== req.user._id.toString()) {
//         return res.redirect('/');
//       }
//       product.title = updatedTitle;
//       product.price = updatedPrice;
//       product.description = updatedDesc;
//       if (image) {
//         fileHelper.deleteFile(product.imageUrl);
//         product.imageUrl = image.path;
//       }
//       return product.save()
//         .then(result => {
//           console.log('UPDATED PRODUCT!');
//           res.redirect('/admin/products');
//         });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getProducts = (req, res, next) => {
//   Product.find({ userId: req.user._id })
//     .then(products => {
//       console.log('admin', products);
//       res.render('admin/products', {
//         prods: products,
//         pageTitle: 'Admin Products',
//         path: '/admin/products'
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.deleteProduct = (req, res, next) => {
//   const prodId = req.params.productId;
//   Product.findById(prodId)
//     .then((product) => {
//       if (!product) {
//         return next(new Error('Product not found!'));
//       }
//       fileHelper.deleteFile(product.imageUrl);
//       return Product.deleteOne({ _id: prodId, userId: req.user._id });
//     })
//     .then(() => {
//       console.log('DESTROYED PRODUCT');
//       res.status(200).json({ message: 'Success!' });
//     })
//     .catch(err => {
//       res.status(500).json({ message: 'Deleting product failed!' });
//     });


// };
