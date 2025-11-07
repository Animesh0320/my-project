// scripts/seed.js
require('dotenv').config(); // Load .env from root
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI;

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared old data.');

    // Create categories
    const categories = [];
    for (let i = 0; i < 5; i++) {
      const category = new Category({ name: faker.commerce.department() });
      const savedCat = await category.save();
      categories.push(savedCat);
    }
    console.log('Created categories.');

    // Create products
    const products = [];
    for (let i = 0; i < 100; i++) {
      products.push({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        inStock: true,
        // Assign a random category
        categoryId: categories[Math.floor(Math.random() * categories.length)]._id,
      });
    }
    
    await Product.insertMany(products);
    console.log('Created 100 products.');

    console.log('✅ Seeding complete!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDB();