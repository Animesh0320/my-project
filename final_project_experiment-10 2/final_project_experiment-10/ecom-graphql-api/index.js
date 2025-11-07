// index.js
require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import your custom files
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { categoryLoader } = require('./graphql/loaders'); // Import your loader

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Apollo Server Setup ---
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// --- Start the Server ---
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    
    // This context function runs with every request
    context: async ({ req }) => {
      let user = null;
      // Get the token from the authorization header
      const token = req.headers.authorization || '';

      if (token && token.startsWith('Bearer ')) {
        const tokenValue = token.replace('Bearer ', '');
        try {
          // Verify the token
          const decoded = jwt.verify(
            tokenValue,
            process.env.JWT_SECRET || 'yoursecretkey'
          );
          // Add the user's core info to the context
          user = { id: decoded.userId, email: decoded.email, role: decoded.role };
        } catch (err) {
          console.log('Invalid/Expired token');
        }
      }

      // Return the context object
      return {
        // We create new loaders for each request to prevent
        // caching data between different users.
        loaders: {
          category: categoryLoader, 
          // e.g., new DataLoader(batchUsers),
        },
        user: user, // The authenticated user (or null)
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
}

startServer();