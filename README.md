# Ecommerce Store API

A comprehensive ecommerce store API built with Node.js, Express, TypeScript, and MongoDB. Features include user authentication, product management, shopping cart functionality, and Stripe payment integration.

## 🚀 Features

- **Authentication**: JWT-based authentication with password encryption
- **User Management**: Registration, login, profile management
- **Product Management**: CRUD operations for products (admin only)
- **Shopping Cart**: Add, update, remove items with variant support
- **Order Management**: Checkout with Stripe integration
- **File Upload**: Profile images and product images
- **Search & Filtering**: Advanced product search and filtering
- **Pagination**: Built-in pagination for product listings
- **Role-based Access**: Admin and user roles with proper authorization

## 📁 Project Structure

```
src/
├── config/
│   ├── database.ts      # MongoDB connection
│   └── environment.ts   # Environment configuration
├── controllers/
│   ├── authController.ts    # Authentication logic
│   ├── productController.ts # Product management
│   ├── cartController.ts    # Shopping cart
│   └── orderController.ts   # Orders & checkout
├── middleware/
│   ├── auth.ts         # JWT authentication
│   ├── asyncHandler.ts # Async error wrapper
│   ├── errorHandler.ts # Global error handling
│   ├── logger.ts       # Request logging
│   └── upload.ts       # File upload handling
├── models/
│   ├── User.ts         # User model
│   ├── Product.ts      # Product model
│   ├── Cart.ts         # Cart model
│   └── Order.ts        # Order model
├── routes/
│   ├── authRoutes.ts   # Authentication routes
│   ├── productRoutes.ts # Product routes
│   ├── cartRoutes.ts   # Cart routes
│   └── orderRoutes.ts  # Order routes
├── types/
│   ├── api.ts          # API response types
│   └── express.d.ts    # Express extensions
├── utils/
│   ├── response.ts     # Response utilities
│   └── validation.ts   # Validation schemas
├── app.ts             # Express app setup
└── index.ts          # Application entry point
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Updated-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   API_PREFIX=/api/v1
   DATABASE_URL=mongodb://localhost:27017/ecommerce-store
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Start MongoDB** (if using local database)
   ```bash
   mongod
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: multipart/form-data

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "phone": "+1234567890",
  "profileImage": [file] // optional
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "username": "new_username",
  "phone": "+1234567890",
  "profileImage": [file] // optional
}
```

### Products

#### Get All Products (with filtering)
```http
GET /api/v1/products?page=1&limit=12&sort=newest&category=electronics&minPrice=10&maxPrice=100&inStock=true
```

#### Get Product by Slug
```http
GET /api/v1/products/slug/product-name-slug
```

#### Get Product by ID
```http
GET /api/v1/products/:id
```

#### Search Products
```http
GET /api/v1/products/search?q=search_term&page=1&limit=12&sort=newest
```

#### Get Categories
```http
GET /api/v1/products/categories
```

#### Create Product (Admin Only)
```http
POST /api/v1/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "description": "Product description",
  "tags": ["electronics", "gadgets"],
  "price": 99.99,
  "colour": "Black",
  "size": "md",
  "totalStock": 100,
  "images": [file1, file2, file3]
}
```

#### Update Product (Admin Only)
```http
PUT /api/v1/products/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Updated Product Name",
  "price": 89.99,
  "images": [file1, file2] // optional
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/v1/products/:id
Authorization: Bearer <admin_token>
```

### Cart

#### Get Cart
```http
GET /api/v1/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/v1/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2,
  "colour": "Red",
  "size": "lg"
}
```

#### Update Cart Item
```http
PUT /api/v1/cart/item/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/v1/cart/item/:itemId
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/v1/cart/clear
Authorization: Bearer <token>
```

#### Get Cart Count
```http
GET /api/v1/cart/count
Authorization: Bearer <token>
```

### Orders

#### Create Checkout Session
```http
POST /api/v1/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "card"
}
```

#### Get User Orders
```http
GET /api/v1/orders/my-orders
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /api/v1/orders/my-orders/:orderId
Authorization: Bearer <token>
```

#### Get All Orders (Admin Only)
```http
GET /api/v1/orders?page=1&limit=10&status=pending
Authorization: Bearer <admin_token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/v1/orders/:orderId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `API_PREFIX` - API route prefix (default: /api/v1)
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `CLOUDINARY_*` - Cloudinary configuration for image uploads

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing for passwords
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configurable CORS for cross-origin requests
- **Security Headers**: XSS protection, content type options
- **Role-based Access**: Admin and user role authorization
- **File Upload Security**: File type and size validation

## 📊 Database Models

### User Model
- username, email, password, phone
- profileImage, role (admin/user)
- timestamps

### Product Model
- name, slug, description, tags
- price, colour, size, images
- inStock, totalStock, soldCount
- timestamps

### Cart Model
- user, items (product, quantity, colour, size)
- totalAmount, timestamps

### Order Model
- user, items, totalAmount
- status, paymentStatus
- shippingAddress, paymentMethod
- stripePaymentIntentId, timestamps

## 🧪 Testing

To add tests to your project:

1. Install testing dependencies:
   ```bash
   npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
   ```

2. Create test files in a `__tests__` directory or with `.test.ts` extension

## 🚀 Deployment

### Docker (Recommended)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY uploads ./uploads
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
Ensure your production environment has:
- Node.js 18+ installed
- MongoDB database
- Environment variables configured
- Proper firewall settings
- SSL/TLS certificates (for HTTPS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Happy Coding! 🎉**
