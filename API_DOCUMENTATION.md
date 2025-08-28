# Ecommerce Store API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "phone": "+1234567890",
  "profileImage": [file] // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Register Admin User
**POST** `/auth/register/admin`

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "confirmPassword": "AdminPass123!",
  "phone": "+1234567890",
  "profileImage": [file] // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "admin_user",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Register User with Role
**POST** `/auth/register/with-role`

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "username": "custom_user",
  "email": "user@example.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "phone": "+1234567890",
  "role": "admin", // or "user"
  "profileImage": [file] // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "admin registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "custom_user",
      "email": "user@example.com",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Login User
**POST** `/auth/login`

**Content-Type:** `application/json`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile
**PUT** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "username": "new_username",
  "phone": "+1234567890",
  "profileImage": [file] // optional
}
```

---

## 📦 Product Endpoints

### Get All Products
**GET** `/products`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12, max: 50) - Items per page
- `sort` (string) - Sort by: `newest`, `price_asc`, `price_desc`, `popular`
- `category` (string) - Filter by category
- `tag` (string) - Filter by tag
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `inStock` (boolean) - Filter by stock availability

**Example:**
```
GET /products?page=1&limit=12&sort=newest&category=electronics&minPrice=10&maxPrice=100&inStock=true
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "product_id",
        "name": "Product Name",
        "slug": "product-name",
        "description": "Product description",
        "tags": ["electronics", "gadgets"],
        "price": 99.99,
        "colour": "Black",
        "size": "md",
        "images": ["image1.jpg", "image2.jpg"],
        "inStock": true,
        "totalStock": 100,
        "soldCount": 5,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Product by Slug
**GET** `/products/slug/:slug`

**Example:**
```
GET /products/slug/product-name
```

### Get Product by ID
**GET** `/products/:id`

### Search Products
**GET** `/products/search`

**Query Parameters:**
- `q` (string, required) - Search query
- `page`, `limit`, `sort` - Same as above

**Example:**
```
GET /products/search?q=laptop&page=1&limit=12&sort=price_asc
```

### Get Categories
**GET** `/products/categories`

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": ["electronics", "clothing", "books"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create Product (Admin Only)
**POST** `/products`

**Headers:** `Authorization: Bearer <admin_token>`

**Content-Type:** `multipart/form-data`

**Body:**
```json
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

### Update Product (Admin Only)
**PUT** `/products/:id`

**Headers:** `Authorization: Bearer <admin_token>`

**Content-Type:** `multipart/form-data`

### Delete Product (Admin Only)
**DELETE** `/products/:id`

**Headers:** `Authorization: Bearer <admin_token>`

---

## 🛒 Cart Endpoints

### Get Cart
**GET** `/cart`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "cart": {
      "id": "cart_id",
      "user": "user_id",
      "items": [
        {
          "id": "item_id",
          "product": {
            "id": "product_id",
            "name": "Product Name",
            "price": 99.99,
            "images": ["image1.jpg"],
            "inStock": true,
            "totalStock": 100
          },
          "quantity": 2,
          "colour": "Red",
          "size": "lg"
        }
      ],
      "totalAmount": 199.98,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Add to Cart
**POST** `/cart/add`

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `application/json`

**Body:**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "colour": "Red",
  "size": "lg"
}
```

### Update Cart Item
**PUT** `/cart/item/:itemId`

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `application/json`

**Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
**DELETE** `/cart/item/:itemId`

**Headers:** `Authorization: Bearer <token>`

### Clear Cart
**DELETE** `/cart/clear`

**Headers:** `Authorization: Bearer <token>`

### Get Cart Count
**GET** `/cart/count`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Cart count retrieved successfully",
  "data": {
    "itemCount": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📋 Order Endpoints

### Create Checkout Session
**POST** `/orders/checkout`

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `application/json`

**Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_test_...",
    "sessionUrl": "https://checkout.stripe.com/...",
    "order": {
      "id": "order_id",
      "user": "user_id",
      "items": [...],
      "totalAmount": 199.98,
      "status": "pending",
      "paymentStatus": "pending",
      "shippingAddress": {...},
      "paymentMethod": "card"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get User Orders
**GET** `/orders/my-orders`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "id": "order_id",
        "user": "user_id",
        "items": [
          {
            "product": {
              "id": "product_id",
              "name": "Product Name",
              "price": 99.99,
              "images": ["image1.jpg"]
            },
            "quantity": 2,
            "price": 99.99,
            "colour": "Red",
            "size": "lg"
          }
        ],
        "totalAmount": 199.98,
        "status": "processing",
        "paymentStatus": "completed",
        "shippingAddress": {...},
        "paymentMethod": "card",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Order by ID
**GET** `/orders/my-orders/:orderId`

**Headers:** `Authorization: Bearer <token>`

### Get All Orders (Admin Only)
**GET** `/orders`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by status

### Update Order Status (Admin Only)
**PUT** `/orders/:orderId/status`

**Headers:** `Authorization: Bearer <admin_token>`

**Content-Type:** `application/json`

**Body:**
```json
{
  "status": "shipped"
}
```

**Valid Statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

## 🏥 Health Check

### Health Check
**GET** `/health`

**Response:**
```json
{
  "success": true,
  "message": "Health check successful",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "environment": "development",
    "version": "1.0.0"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔧 Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Bad request",
  "error": "Validation error details",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Access denied. No token provided.",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Product not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

---

## 📝 Notes

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **File Upload:**
   - Profile images: Single file, max 5MB
   - Product images: Multiple files (max 5), max 5MB each
   - Supported formats: Images only (jpg, png, gif, etc.)

3. **Pagination:**
   - Default limit: 12 items per page
   - Maximum limit: 50 items per page

4. **Sorting Options:**
   - `newest` - By creation date (newest first)
   - `price_asc` - By price (low to high)
   - `price_desc` - By price (high to low)
   - `popular` - By sold count (most popular first)

5. **Role-based Access:**
   - `user` - Can view products, manage cart, place orders
   - `admin` - Can manage products, view all orders, update order status

6. **Stripe Integration:**
   - Requires valid Stripe secret key in environment variables
   - Checkout sessions redirect to Stripe hosted checkout
   - Payment success/failure handled via webhooks
