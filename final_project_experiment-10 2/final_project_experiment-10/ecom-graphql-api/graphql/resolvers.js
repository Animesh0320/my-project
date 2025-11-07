// graphql/resolvers.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const { GraphQLError } = require('graphql');
const { GraphQLScalarType, Kind } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const graphqlFields = require('graphql-fields'); // <-- Added

// Custom scalar for Date
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value); // value from the client
  },
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString(); // value sent to the client
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // ast value is always a string
    }
    return null;
  },
});

const resolvers = {
  DateTime: dateTimeScalar, // Register the custom scalar

  Query: {
    // --- This is the updated 'products' resolver ---
    products: async (parent, { filter = {}, limit = 10, offset = 0 }, context, info) => {
      
      // --- Add this line to parse the query ---
      // 'info' is the 4th argument to every resolver
      const fields = graphqlFields(info);

      // 1. Build the filter query for Mongoose
      let query = {};
      
      if (filter.inStock !== undefined) {
        query.inStock = filter.inStock;
      }
      if (filter.priceMin !== undefined) {
        query.price = { ...query.price, $gte: filter.priceMin };
      }
      if (filter.priceMax !== undefined) {
        query.price = { ...query.price, $lte: filter.priceMax };
      }
      if (filter.categoryId) {
        query.categoryId = filter.categoryId;
      }
      if (filter.searchTerm) {
        query.$text = { $search: filter.searchTerm };
      }

      // 2. Build the projections (select)
      // fields.products will contain the fields requested *inside* the 'products' array
      let projections = {};
      if (fields.products) {
        // We always need 'categoryId' for the 'category' field resolver to work
        projections = { ...fields.products, categoryId: 1 };
        // If 'products' is just a top-level field (not nested), fields might be directly on 'fields'
      } else if (Object.keys(fields).length > 0) {
         projections = { ...fields, categoryId: 1 };
      }

      // Handle the case where the key might be 'products' (from ProductConnection)
      const requestedFields = fields.products ? fields.products : fields;
      let selectString = Object.keys(requestedFields).join(' ');
      if (selectString && !selectString.includes('categoryId')) {
         selectString += ' categoryId'; // Ensure categoryId is always fetched
      }
      
      // 3. Fetch data and total count in parallel
      const [products, totalCount] = await Promise.all([
        Product.find(query)
          .select(selectString) // <-- This is the optimization
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 }), 
        Product.countDocuments(query)
      ]);

      return {
        products,
        totalCount,
      };
    },
    
    product: async (parent, { id }) => {
      // Find a single product by its Mongoose ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Product ID', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      return await Product.findById(id);
    },
    categories: async () => await Category.find({}),

    myOrders: async (parent, args, context) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await Order.find({ user: context.user.id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    createProduct: async (parent, { name, description, price }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      const newProduct = new Product({ name, description, price });
      await newProduct.save();
      return newProduct;
    },
    createCategory: async (parent, { name }) => {
      const newCategory = new Category({ name });
      await newCategory.save();
      return newCategory;
    },

    register: async (parent, { email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const user = new User({ email, password, role: 'admin' }); 
      await user.save();

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'yoursecretkey', 
        { expiresIn: '1d' }
      );

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'yoursecretkey',
        { expiresIn: '1d' }
      );

      return { token, user };
    },

    placeOrder: async (parent, { items }, context) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!items || items.length === 0) {
        throw new GraphQLError('Cart is empty', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        let totalAmount = 0;
        const orderItems = [];
        const productIds = items.map(item => item.productId);

        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [p.id.toString(), p]));

        for (const item of items) {
          const product = productMap.get(item.productId);

          if (!product) {
            throw new GraphQLError(`Product not found: ${item.productId}`, { 
              extensions: { code: 'BAD_USER_INPUT' }
            });
          }

          if (!product.inStock) {
             throw new GraphQLError(`${product.name} is out of stock`, { 
              extensions: { code: 'BAD_REQUEST' }
            });
          }

          totalAmount += product.price * item.quantity;
          orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
          });
        }

        const order = new Order({
          user: context.user.id,
          items: orderItems,
          totalAmount: totalAmount,
        });
        await order.save();

        return order;
      } catch (error) {
        throw error;
      }
    },
  },

  // Resolver for the 'category' field on the 'Product' type
  Product: {
    category: async (parent, args, context) => {
      if (!parent.categoryId) return null;
      return context.loaders.category.load(parent.categoryId.toString());
    }
  },

  // To resolve the nested 'user' field on an Order
  Order: {
    user: async (parent, args, context) => {
      // Use DataLoader if you have one for Users!
      return await User.findById(parent.user);
    }
  }
};

module.exports = resolvers;