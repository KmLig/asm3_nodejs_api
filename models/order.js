const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  delivery: {
    type: Boolean,
    required: true
  },
  status: {
    type: Boolean,
    required: true
  }

});

module.exports = mongoose.model('Order', orderSchema);
