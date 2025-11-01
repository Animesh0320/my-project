const express = require('express');
const app = express();
const PORT = 3000;

// 1. Logging Middleware (Global)
// This middleware will run for every request that comes to the server.
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Method: ${req.method}, URL: ${req.originalUrl}`);
  next(); // Pass control to the next middleware/handler in the stack.
};

// 2. Authentication Middleware
// This middleware checks for a valid Bearer token.
const bearerTokenAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const secretToken = 'mysecrettoken';

  // Check if the Authorization header exists and is in the correct format
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract the token from the header (e.g., "Bearer <token>")
    const token = authHeader.split(' ')[1];

    if (token === secretToken) {
      // If the token is correct, proceed to the route handler
      next();
    } else {
      // If the token is incorrect, send a 401 Unauthorized response
      res.status(401).json({ message: 'Authorization header missing or incorrect' });
    }
  } else {
    // If the header is missing or malformed, send a 401 Unauthorized response
    res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }
};

// Apply the logging middleware globally to all routes
app.use(requestLogger);

// --- Routes ---

// Public Route: Accessible by anyone, no authentication needed.
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

// Protected Route: Requires the bearerTokenAuth middleware to pass.
app.get('/protected', bearerTokenAuth, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});