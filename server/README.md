# ManoMitra Backend Server

A comprehensive mental wellness and support platform backend built with Node.js, Express.js, and MongoDB.

## 🚀 Features

### Core Functionality
- **User Management**: Multi-role authentication system (Student, Counsellor, Volunteer, Admin)
- **Booking System**: Appointment scheduling with counsellors
- **Peer Support**: Real-time chat rooms for peer support
- **Reporting System**: Anonymous reporting with priority management
- **Feedback System**: Rating and feedback for services
- **Notification System**: Real-time notifications across multiple channels
- **File Management**: Secure file uploads and attachments

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input sanitization and XSS protection
- Rate limiting and DDoS protection
- CORS configuration
- Helmet security headers
- Request validation with Zod

### Performance & Monitoring
- Comprehensive logging system
- Performance monitoring
- Request tracking with unique IDs
- Security event logging
- Health check endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Security**: bcryptjs, helmet, xss-clean
- **File Upload**: Multer
- **Logging**: Morgan with custom tokens
- **Rate Limiting**: express-rate-limit

## 📁 Project Structure

```
server/
├── auth/                 # Authentication utilities
├── constants/           # Application constants
├── controllers/         # Route controllers
├── db/                 # Database connection
├── middlewares/        # Custom middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── logs/               # Application logs
├── .env                # Environment variables
├── server.js           # Main server file
└── package.json        # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ManoMitra/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/manomitra
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   
   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
