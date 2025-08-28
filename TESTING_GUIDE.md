# API Testing Guide

## 🚀 Quick Start

1. **Start Server:** `npm run dev`
2. **Create Admin:** `npm run create-admin`
3. **Test with Thunder Client**

## 📋 All API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user  
- `GET /api/v1/auth/profile` - Get profile
- `PUT /api/v1/auth/profile` - Update profile

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/categories` - Get categories
- `GET /api/v1/products/slug/:slug` - Get by slug
- `GET /api/v1/products/:id` - Get by ID
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:id` - Update product (admin)
- `DELETE /api/v1/products/:id` - Delete product (admin)

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/add` - Add to cart
- `PUT /api/v1/cart/item/:itemId` - Update cart item
- `DELETE /api/v1/cart/item/:itemId` - Remove from cart
- `DELETE /api/v1/cart/clear` - Clear cart
- `GET /api/v1/cart/count` - Get cart count

### Orders
- `POST /api/v1/orders/checkout` - Create checkout
- `GET /api/v1/orders/my-orders` - Get user orders
- `GET /api/v1/orders/my-orders/:orderId` - Get order by ID
- `GET /api/v1/orders` - Get all orders (admin)
- `PUT /api/v1/orders/:orderId/status` - Update order status (admin)

### Health
- `GET /api/v1/health` - Health check
- `GET /api/v1/ready` - Readiness check

## 🧪 Thunder Client Testing

### 1. Register User
```
POST http://localhost:3000/api/v1/auth/register
Content-Type: multipart/form-data

username: john_doe
email: john@example.com
password: StrongPass123!
confirmPassword: StrongPass123!
phone: +1234567890
```

### 2. Login User
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

### 3. Get Profile (with token)
```
GET http://localhost:3000/api/v1/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. Create Product (admin)
```
POST http://localhost:3000/api/v1/products
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: multipart/form-data

name: Test Product
description: Test description
tags: electronics,gadgets
price: 99.99
colour: Black
size: md
totalStock: 100
images: [file1, file2]
```

### 5. Get Products
```
GET http://localhost:3000/api/v1/products?page=1&limit=12&sort=newest
```

### 6. Add to Cart
```
POST http://localhost:3000/api/v1/cart/add
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": "PRODUCT_ID",
  "quantity": 2,
  "colour": "Red",
  "size": "lg"
}
```

### 7. Get Cart
```
GET http://localhost:3000/api/v1/cart
Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. Create Checkout
```
POST http://localhost:3000/api/v1/orders/checkout
Authorization: Bearer YOUR_JWT_TOKEN
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

## 🔑 Environment Setup

Create `.env` file:
```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1
DATABASE_URL=mongodb://127.0.0.1:27017/ecommerce-store
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## ✅ All Requirements Completed

- ✅ JWT Authentication
- ✅ User Registration/Login
- ✅ Password Validation (8 chars, uppercase, lowercase, number, special char)
- ✅ Profile Image Upload
- ✅ Product CRUD (Admin only)
- ✅ Product Filtering & Pagination
- ✅ Product Search
- ✅ Cart Functionality
- ✅ Order Management
- ✅ Stripe Integration
- ✅ File Upload
- ✅ Role-based Access
- ✅ Input Validation
- ✅ Error Handling
- ✅ TypeScript
- ✅ MongoDB Integration
