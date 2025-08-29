# 🚀 ManoMitra Setup Guide

## Prerequisites
- Node.js 18+ 
- MongoDB running locally or accessible
- npm or yarn package manager

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create Environment File
Create a `.env` file in the `server` directory:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/manomitra

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=600

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Create Required Directories
```bash
cd server
mkdir -p uploads/reports uploads/profiles uploads/documents logs
```

### 4. Start MongoDB
Make sure MongoDB is running on your system.

### 5. Start Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:5000`

## 🌐 Frontend Setup

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Install Missing Dependencies
```bash
npm install @radix-ui/react-avatar @radix-ui/react-tabs
```

### 3. Create Environment File
Create a `.env.local` file in the `web` directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=ManoMitra
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🧪 Testing the Setup

### 1. Backend Health Check
Visit `http://localhost:5000/health` - should return server status

### 2. Frontend Landing Page
Visit `http://localhost:3000` - should show the landing page

### 3. Test Authentication
- Navigate to `/login`
- Try logging in with test credentials
- Check if dashboard loads correctly

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process on port 5000

3. **JWT Secret Missing**
   - Ensure JWT_SECRET is set in .env file
   - Generate a strong secret key

#### Frontend Issues
1. **API Connection Error**
   - Verify NEXT_PUBLIC_API_URL in .env.local
   - Ensure backend is running
   - Check CORS configuration

2. **Missing Dependencies**
   - Run `npm install` again
   - Clear node_modules and reinstall
   - Check package.json for missing packages

3. **Build Errors**
   - Check TypeScript errors
   - Verify all imports are correct
   - Clear .next directory and rebuild

### Environment Variables Checklist

#### Backend (.env)
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] PORT
- [ ] NODE_ENV
- [ ] CLIENT_URL

#### Frontend (.env.local)
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_WS_URL

## 📁 Project Structure

```
ManoMitra/
├── server/                 # Backend API
│   ├── .env               # Backend environment variables
│   ├── server.js          # Main server file
│   ├── models/            # Database models
│   ├── controllers/       # Business logic
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middleware
│   └── uploads/           # File uploads
├── web/                   # Frontend application
│   ├── .env.local         # Frontend environment variables
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utility libraries
│   └── store/             # State management
└── SETUP.md               # This file
```

## 🔒 Security Notes

1. **Never commit .env files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Set proper CORS origins** for production
5. **Use environment-specific configurations**

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use production MongoDB instance
3. Set strong JWT secrets
4. Enable HTTPS
5. Set proper CORS origins

### Frontend
1. Build with `npm run build`
2. Set production API URLs
3. Enable HTTPS
4. Configure CDN if needed

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Check console logs for errors
4. Ensure all dependencies are installed
5. Verify MongoDB connection

---

**Happy Coding! 🎉**
