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

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - Universal login for all user types
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/socket-token` - Get WebSocket authentication token

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/dashboard` - Get student dashboard data
- `GET /api/students/counsellors` - Get available counsellors
- `GET /api/students/volunteers` - Get available volunteers
- `POST /api/students/counsellors/connect` - Connect with counsellor
- `DELETE /api/students/counsellors/:id` - Disconnect from counsellor

### Counsellors
- `GET /api/counsellors/profile` - Get counsellor profile
- `PUT /api/counsellors/profile` - Update counsellor profile
- `GET /api/counsellors/dashboard` - Get counsellor dashboard
- `GET /api/counsellors/students` - Get connected students
- `GET /api/counsellors/schedule` - Get counsellor schedule
- `PUT /api/counsellors/availability` - Update availability

### Volunteers
- `GET /api/volunteers/profile` - Get volunteer profile
- `PUT /api/volunteers/profile` - Update volunteer profile
- `GET /api/volunteers/dashboard` - Get volunteer dashboard
- `GET /api/volunteers/rooms` - Get moderated rooms
- `GET /api/volunteers/performance` - Get performance metrics

### Bookings
- `POST /api/bookings/student` - Create booking (student)
- `GET /api/bookings/student` - Get student bookings
- `GET /api/bookings/counsellor` - Get counsellor bookings
- `PUT /api/bookings/counsellor/:id/confirm` - Confirm booking
- `PUT /api/bookings/counsellor/:id/reject` - Reject booking

### Reports
- `POST /api/reports/my` - Create report (student)
- `GET /api/reports/my` - Get student reports
- `GET /api/reports/assigned` - Get assigned reports (counsellor)
- `PUT /api/reports/assigned/:id/status` - Update report status

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback` - Get feedback for target
- `GET /api/feedback/my` - Get user's feedback
- `PUT /api/feedback/:id` - Update feedback

### Rooms (Peer Support)
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:topic` - Get room by topic
- `GET /api/rooms/:id/messages` - Get room messages
- `GET /api/rooms/:id/stats` - Get room statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/students` - Get all students
- `GET /api/admin/counsellors` - Get all counsellors
- `GET /api/admin/volunteers` - Get all volunteers
- `GET /api/admin/reports` - Get all reports
- `POST /api/admin/notifications/system` - Send system notification

## 🔌 WebSocket Events

### Peer Support Namespace (`/peer`)
- `join` - Join a support room
- `message` - Send message to room
- `typing` - User typing indicator
- `history` - Get message history
- `disconnect` - User disconnected

## 📊 Database Models

### User Models
- **Student**: Academic information, preferences, connections
- **Counsellor**: Qualifications, experience, availability, students
- **Volunteer**: Skills, interests, availability, moderated rooms
- **Admin**: Permissions, system access level

### Core Models
- **Booking**: Appointment scheduling and management
- **Report**: Student reports with priority and assignment
- **Feedback**: Rating and feedback system
- **Message**: Chat messages with reactions and mentions
- **Room**: Peer support chat rooms
- **Notification**: Multi-channel notification system

## 🛡️ Security Features

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control
- Password hashing with bcrypt
- Token expiration and rotation

### Input Validation
- Zod schema validation
- XSS protection with xss-clean
- HTML sanitization with sanitize-html
- SQL injection prevention

### Rate Limiting
- Configurable rate limiting
- Per-IP request tracking
- DDoS protection

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Content Security Policy (CSP)

## 📝 Logging

### Log Types
- **Access Logs**: All HTTP requests
- **Error Logs**: Error responses and exceptions
- **Security Logs**: Suspicious activity detection
- **Performance Logs**: Slow request monitoring

### Log Formats
- **Development**: Colored, human-readable format
- **Production**: Structured JSON format
- **Custom Tokens**: Request ID, user info, timing

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database
- Use MongoDB Atlas for cloud deployment
- Set up proper indexes for performance
- Configure backup and monitoring

### Security
- Use strong JWT secrets
- Enable HTTPS in production
- Configure proper CORS origins
- Set up rate limiting

### Monitoring
- Enable comprehensive logging
- Set up health check endpoints
- Monitor performance metrics
- Track security events

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
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- User management system
- Booking and reporting features
- Real-time peer support
- Comprehensive security features
- Advanced logging and monitoring
