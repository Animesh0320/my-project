// graphql/loaders.js
const DataLoader = require('dataloader');
const Category = require('../models/Category');

// Batch function to get categories by their IDs
const batchCategories = async (categoryIds) => {
  console.log('BATCH: Fetching categories for IDs:', categoryIds);
  const categories = await Category.find({ _id: { $in: categoryIds } });

  // Map IDs to categories to ensure correct order
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id] = cat;
  });

  return categoryIds.map(id => categoryMap[id] || null);
};

// Create and export the loader
exports.categoryLoader = new DataLoader(batchCategories);