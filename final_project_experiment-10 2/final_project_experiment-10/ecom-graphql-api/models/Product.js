// models/Product.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  inStock: { type: Boolean, default: true },
  
  // --- This is the new line you added ---
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },

}, { timestamps: true }); // Adds createdAt and updatedAt

// Create a text index for searching name and description
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);