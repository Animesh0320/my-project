// graphql/schema.js
const typeDefs = `#graphql
  scalar DateTime # Custom scalar for dates

  # --- Category Type ---
  type Category {
    id: ID!
    name: String!
  }

  # --- Product Type ---
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    inStock: Boolean
    createdAt: DateTime
    category: Category # Linked to Category
  }

  # --- User Type ---
  type User {
    id: ID!
    email: String!
    role: String!
  }

  # --- AuthPayload Type ---
  type AuthPayload {
    token: String!
    user: User!
  }

  # --- Order Status Enum (NEW) ---
  enum OrderStatus {
    Pending
    Completed
    Cancelled
  }

  # --- OrderItem Type (NEW) ---
  type OrderItem {
    id: ID!
    name: String!
    price: Float!
    quantity: Int!
    product: Product # We can resolve this if needed
  }

  # --- Order Type (NEW) ---
  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    totalAmount: Float!
    status: OrderStatus!
    createdAt: DateTime!
  }

  # --- OrderItemInput Type (NEW) ---
  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  # --- Product Filter Input ---
  # (This was from a previous step, keeping it for a complete schema)
  input ProductFilterInput {
    inStock: Boolean
    priceMin: Float
    priceMax: Float
    categoryId: ID
    searchTerm: String
  }

  # --- Product Connection Type ---
  # (This was from a previous step)
  type ProductConnection {
    products: [Product]!
    totalCount: Int!
  }


  # --- Query Type ---
  type Query {
    "Gets all products (with filtering/pagination)"
    products(
      filter: ProductFilterInput
      limit: Int = 10
      offset: Int = 0
    ): ProductConnection
    
    "Gets a single product by its ID"
    product(id: ID!): Product
    
    "Gets all categories"
    categories: [Category]

    "Gets the logged-in user's order history (NEW)"
    myOrders: [Order]
  }

  # --- Mutation Type ---
  type Mutation {
    "Creates a new product (admin only)"
    createProduct(name: String!, description: String, price: Float!): Product
    
    "Creates a new category"
    createCategory(name: String!): Category

    "Registers a new user"
    register(email: String!, password: String!): AuthPayload

    "Logs in a user"
    login(email: String!, password: String!): AuthPayload

    "Places a new order. Requires authentication. (NEW)"
    placeOrder(items: [OrderItemInput!]!): Order
  }
`;

module.exports = typeDefs;