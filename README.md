# E-commerce Backend API

This repository contains the backend for an e-commerce application built using **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, and **Cloudinary** for handling image uploads. It provides functionalities such as user authentication, product management, cart management, order processing, and review systems.

## Features

- **User Authentication**: Sign up, sign in, and password reset functionality.
- **Admin Capabilities**: Product, category, subcategory, and coupon management (create, update, delete).
- **Order Management**: Cart management and order status updates.
- **Product Reviews**: Users can add, edit, or delete product reviews.
- **Coupon System**: Admins can create and users can apply coupons.
- **Role-Based Authorization**: Different user roles (Admin/User) with specific permissions.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable and high-performance applications.
- **Express.js**: Web framework for routing and handling HTTP requests.
- **MongoDB**: NoSQL database for storing and managing application data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB to manage data relationships and schema.
- **Cloudinary**: Image and media storage and management service.
- **bcryptjs**: Library for hashing passwords securely.
- **jsonwebtoken**: For creating and verifying JWT tokens for authentication.
- **multer**: Middleware for handling file uploads (used for product image uploads).
- **dotenv**: For managing environment variables.
- **slugify**: Converts strings into URL-friendly slugs.
- **joi**: Data validation library to ensure incoming requests follow the required structure.
- **nodemailer**: For sending emails (used for password reset and confirmation emails).
- **cors**: Middleware to allow cross-origin resource sharing.
- **nanoid**: Used to generate unique IDs, like verification codes for forgotten passwords.

## Model Relationships

1. **User - Order**:  
   - A **User** can place multiple **Orders**. The `Order` model references `User` via `userId`.
   
2. **Product - Category & Subcategory**:  
   - A **Product** belongs to a **Category** and a **Subcategory**. Both are referenced via `categoryId` and `subcategoryId`.
   
3. **Product - Review**:  
   - A **Product** can have multiple **Reviews**, and each review belongs to a **Product**. Reviews are linked to products using `productId`.

4. **Product - Cart**:  
   - A **Cart** stores products that a **User** has added. Each product in the cart is linked to the `Product` model by `productId`.

5. **Order - Product**:  
   - An **Order** contains multiple **Products**, with each product referencing the `Product` model by `productId`.

6. **Coupon - User**:  
   - A **Coupon** can be used by multiple **Users**, and each coupon has a list of `usedBy` referencing users who have applied it.

## Postman Collection

You can use the Postman collection for testing the API. The collection includes all the endpoints listed above with examples for each request.

- **Postman Collection URL**: [E-commerce Backend Postman Collection](https://documenter.getpostman.com/view/28559046/2s9YRB4D3y) 

---

## Environment Variables

Create a `.env` file with the following configuration:


## Deployment

This backend is deployed on **Render**. To deploy it yourself:

1. Create an account on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set up environment variables in the Render dashboard.
4. Deploy the application.

---

## Installation

1. Clone the repository:
   ```bash
