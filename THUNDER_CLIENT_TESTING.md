# Thunder Client API Testing Guide

## 🚀 Setup Instructions

### 1. Install Thunder Client
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "Thunder Client"
- Install the extension

### 2. Start the Server
```bash
npm run dev
```

### 3. Create Admin User (Optional)
```bash
npm run create-admin
```

## 📋 Complete API Testing List

### 🔐 Authentication APIs

#### 1. Register User
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/auth/register`
- **Headers:** 
  - Content-Type: `multipart/form-data`
- **Body (Form Data):**
  ```
  username: john_doe
  email: john@example.com
  password: StrongPass123!
  confirmPassword: StrongPass123!
  phone: +1234567890
  profileImage: [file] (optional)
  ```

#### 2. Login User
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:** 
  - Content-Type: `application/json`
- **Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "StrongPass123!"
  }
  ```

#### 3. Get Profile
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/auth/profile`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

#### 4. Update Profile
- **Method:** PUT
- **URL:** `http://localhost:3000/api/v1/auth/profile`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`
  - Content-Type: `multipart/form-data`
- **Body (Form Data):**
  ```
  username: new_username
  phone: +1234567890
  profileImage: [file] (optional)
  ```

### 📦 Product APIs

#### 5. Get All Products
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/products`
- **Query Parameters (optional):**
  ```
  page=1&limit=12&sort=newest&category=electronics&minPrice=10&maxPrice=100&inStock=true
  ```

#### 6. Get Product by Slug
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/products/slug/product-name`

#### 7. Get Product by ID
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/products/PRODUCT_ID`

#### 8. Search Products
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/products/search?q=laptop&page=1&limit=12&sort=price_asc`

#### 9. Get Categories
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/products/categories`

#### 10. Create Product (Admin Only)
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/products`
- **Headers:** 
  - Authorization: `Bearer ADMIN_JWT_TOKEN`
  - Content-Type: `multipart/form-data`
- **Body (Form Data):**
  ```
  name: Product Name
  description: Product description
  tags: electronics,gadgets
  price: 99.99
  colour: Black
  size: md
  totalStock: 100
  images: [file1, file2, file3]
  ```

#### 11. Update Product (Admin Only)
- **Method:** PUT
- **URL:** `http://localhost:3000/api/v1/products/PRODUCT_ID`
- **Headers:** 
  - Authorization: `Bearer ADMIN_JWT_TOKEN`
  - Content-Type: `multipart/form-data`
- **Body (Form Data):**
  ```
  name: Updated Product Name
  price: 89.99
  images: [file1, file2] (optional)
  ```

#### 12. Delete Product (Admin Only)
- **Method:** DELETE
- **URL:** `http://localhost:3000/api/v1/products/PRODUCT_ID`
- **Headers:** 
  - Authorization: `Bearer ADMIN_JWT_TOKEN`

### 🛒 Cart APIs

#### 13. Get Cart
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/cart`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

#### 14. Add to Cart
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/cart/add`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`
  - Content-Type: `application/json`
- **Body (JSON):**
  ```json
  {
    "productId": "PRODUCT_ID",
    "quantity": 2,
    "colour": "Red",
    "size": "lg"
  }
  ```

#### 15. Update Cart Item
- **Method:** PUT
- **URL:** `http://localhost:3000/api/v1/cart/item/ITEM_ID`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`
  - Content-Type: `application/json`
- **Body (JSON):**
  ```json
  {
    "quantity": 3
  }
  ```

#### 16. Remove from Cart
- **Method:** DELETE
- **URL:** `http://localhost:3000/api/v1/cart/item/ITEM_ID`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

#### 17. Clear Cart
- **Method:** DELETE
- **URL:** `http://localhost:3000/api/v1/cart/clear`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

#### 18. Get Cart Count
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/cart/count`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

### 📋 Order APIs

#### 19. Create Checkout Session
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/orders/checkout`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`
  - Content-Type: `application/json`
- **Body (JSON):**
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

#### 20. Get User Orders
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/orders/my-orders`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

#### 21. Get Order by ID
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/orders/my-orders/ORDER_ID`
- **Headers:** 
  - Authorization: `Bearer YOUR_JWT_TOKEN`

#### 22. Get All Orders (Admin Only)
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/orders?page=1&limit=10&status=pending`
- **Headers:** 
  - Authorization: `Bearer ADMIN_JWT_TOKEN`

#### 23. Update Order Status (Admin Only)
- **Method:** PUT
- **URL:** `http://localhost:3000/api/v1/orders/ORDER_ID/status`
- **Headers:** 
  - Authorization: `Bearer ADMIN_JWT_TOKEN`
  - Content-Type: `application/json`
- **Body (JSON):**
  ```json
  {
    "status": "shipped"
  }
  ```

### 🏥 Health Check APIs

#### 24. Health Check
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/health`

#### 25. Readiness Check
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/ready`

## 🧪 Testing Workflow

### Step 1: Test Health Check
1. Open Thunder Client
2. Create new request
3. Set method to GET
4. Enter URL: `http://localhost:3000/api/v1/health`
5. Send request
6. Should return 200 OK

### Step 2: Register a User
1. Create new request
2. Set method to POST
3. Enter URL: `http://localhost:3000/api/v1/auth/register`
4. Set Content-Type to `multipart/form-data`
5. Add form fields as shown above
6. Send request
7. Copy the JWT token from response

### Step 3: Test Authentication
1. Create new request
2. Set method to GET
3. Enter URL: `http://localhost:3000/api/v1/auth/profile`
4. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
5. Send request
6. Should return user profile

### Step 4: Create Products (Admin)
1. First create admin user or use existing admin token
2. Create new request
3. Set method to POST
4. Enter URL: `http://localhost:3000/api/v1/products`
5. Add Authorization header: `Bearer ADMIN_JWT_TOKEN`
6. Set Content-Type to `multipart/form-data`
7. Add form fields as shown above
8. Send request

### Step 5: Test Cart Operations
1. Get products first to get product IDs
2. Add items to cart
3. Update quantities
4. Remove items
5. Clear cart

### Step 6: Test Orders
1. Add items to cart first
2. Create checkout session
3. View orders
4. Update order status (admin only)

## 🔑 Environment Variables

Create a `.env` file in your project root:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1
DATABASE_URL=mongodb://127.0.0.1:27017/ecommerce-store
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 📝 Testing Tips

1. **Save JWT Tokens:** Create environment variables in Thunder Client for tokens
2. **Use Collections:** Organize requests into collections (Auth, Products, Cart, Orders)
3. **Test Error Cases:** Try invalid data to test validation
4. **Check Status Codes:** Verify correct HTTP status codes
5. **Validate Responses:** Check response format matches documentation

## 🐛 Common Issues

1. **MongoDB Connection:** Make sure MongoDB is running
2. **JWT Token:** Ensure token is valid and not expired
3. **File Upload:** Use multipart/form-data for file uploads
4. **Authorization:** Check if you have the right role (admin vs user)
5. **Validation:** Ensure all required fields are provided

## 📊 Expected Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```
