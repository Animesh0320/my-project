// models/Order.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// This schema is "embedded" inside the Order. It won't be its own model.
const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Denormalized name
  price: { type: Number, required: true }, // Price at time of purchase
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema], // Array of embedded items
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Order', orderSchema);